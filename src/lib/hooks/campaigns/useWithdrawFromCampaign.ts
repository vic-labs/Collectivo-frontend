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
import { updateCampaignQueryData } from '@/utils/campaigns';
import { formatSuiAmount } from '@/lib/app-utils';
import { ViewTxLink } from '@/components/view-tx-link';
import { MIST_PER_SUI } from '@mysten/sui/utils';

export function useWithdrawFromCampaign(campaignId: string) {
	const [isWithdrawing, setIsWithdrawing] = useState(false);
	const queryClient = useQueryClient();
	const client = useSuiClient();
	const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
	const currentAccount = useCurrentAccount();

	const withdrawFromCampaign = useCallback(async (params: {
		amount: number;
		availableBalance: number;
	}) => {
		if (!currentAccount) {
			throw new Error('Please connect your wallet to withdraw');
		}

		// Validation
		if (!params.amount || params.amount <= 0) {
			throw new Error('Please enter a valid amount');
		}

		if (params.amount > params.availableBalance) {
			throw new Error(`Cannot withdraw more than ${params.availableBalance} SUI`);
		}

		// Build transaction
		const tx = new Transaction();

		tx.add(
			campaignModule.withdraw({
				arguments: {
					campaign: campaignId,
					amount: getMist(params.amount),
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
				testResults.effects?.status?.error || 'Failed to withdraw'
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

		// Update query data
		updateCampaignQueryData(queryClient, campaignId, {
			suiRaisedChange: -params.amount,
			newWithdrawal: {
				id: Date.now(),
				amount: params.amount,
				campaignId: campaignId,
				contributor: currentAccount.address,
				txDigest: result.digest,
				withdrawnAt: new Date(),
				isFullWithdrawal: params.amount === params.availableBalance,
			},
		});

		return {
			amount: params.amount,
			digest: result.digest,
		};
	}, [campaignId, client, currentAccount, signAndExecuteTransaction, queryClient]);

	const withdrawFromCampaignWithToast = useCallback(async (params: {
		amount: number;
		availableBalance: number;
	}) => {
		setIsWithdrawing(true);

		try {
			toast.promise(withdrawFromCampaign(params), {
				loading: `Withdrawing ${formatSuiAmount(params.amount)} SUI...`,
				success: (data) => ({
					message: `You just withdrew ${formatSuiAmount(data.amount)} SUI`,
					action: React.createElement(ViewTxLink, { txHash: data.digest }),
				}),
				error: (error: any) => {
					if (error instanceof Error) {
						return {
							message: error.message,
						};
					}
					return {
						message: 'Failed to withdraw. Please try again.',
					};
				},
			});
		} finally {
			setIsWithdrawing(false);
		}
	}, [withdrawFromCampaign]);

	return { withdrawFromCampaign: withdrawFromCampaignWithToast, isWithdrawing };
}

function getMist(amount: number) {
	const mistAmount = amount * Number(MIST_PER_SUI);
	return BigInt(Math.floor(mistAmount));
}