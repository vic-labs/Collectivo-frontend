import React, { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
	useSignAndExecuteTransaction,
	useCurrentAccount,
	useSuiClient,
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import * as campaignModule from '@/contract-sdk/collectivo/campaign';
import { ViewTxLink } from '@/components/view-tx-link';
import { useRouter } from '@tanstack/react-router';

import { TOAST_DESCRIPTION_CLASSNAME } from '@/lib/constants';

const descriptionClassName = TOAST_DESCRIPTION_CLASSNAME;

export function useDeleteCampaign({ campaignId }: { campaignId: string }) {
	const [isDeleting, setIsDeleting] = useState(false);
	const queryClient = useQueryClient();
	const client = useSuiClient();
	const { mutateAsync: signAndExecuteTransaction } =
		useSignAndExecuteTransaction();
	const currentAccount = useCurrentAccount();
	const router = useRouter();

	const deleteCampaign = useCallback(async () => {
		if (!currentAccount) {
			throw new Error('Please connect your wallet to delete this campaign');
		}

		// Build transaction
		const tx = new Transaction();

		tx.add(
			campaignModule._delete({
				arguments: {
					campaign: campaignId,
				},
			})
		);

		// Execute transaction with simulation
		const testResults = await client.devInspectTransactionBlock({
			sender: currentAccount.address,
			transactionBlock: tx,
		});

		console.log(testResults);

		if (testResults.effects?.status?.status !== 'success') {
			throw new Error(
				testResults.effects?.status?.error || 'Failed to delete campaign'
			);
		}

		const result = await signAndExecuteTransaction({
			transaction: tx,
		});

		const finalResult = await client.waitForTransaction({
			digest: result.digest,
			options: {
				showEffects: true,
				showEvents: true,
			},
		});

		if (finalResult.effects?.status?.status !== 'success') {
			throw new Error(
				finalResult.effects?.status?.error || 'Transaction failed'
			);
		}

		// Optimistically remove campaign from cache
		queryClient.setQueryData(['campaign', campaignId], null);

		// Remove from campaigns list
		queryClient.setQueriesData({ queryKey: ['campaigns'] }, (oldData: any) => {
			if (!oldData) return oldData;
			return oldData.filter((c: any) => c.id !== campaignId);
		});

		// Navigate to campaigns page
		router.navigate({
			to: '/campaigns',
			replace: true,
			search: undefined as any,
		});

		return {
			digest: result.digest,
		};
	}, [
		campaignId,
		client,
		currentAccount,
		signAndExecuteTransaction,
		queryClient,
		router,
	]);

	const deleteCampaignWithToast = useCallback(async () => {
		setIsDeleting(true);

		try {
			toast.promise(deleteCampaign(), {
				loading: 'Deleting campaign...',
				success: (data) => ({
					message: 'Campaign deleted successfully',
					action: React.createElement(ViewTxLink, { txHash: data.digest }),
				}),
				error: (error: any) => {
					if (error instanceof Error) {
						return {
							message: error.message,
						};
					}
					return {
						message: 'Failed to delete campaign',
						description: 'If this error persists, please contact support',
						descriptionClassName,
					};
				},
			});
		} finally {
			setIsDeleting(false);
		}
	}, [deleteCampaign]);

	return { deleteCampaign: deleteCampaignWithToast, isDeleting };
}
