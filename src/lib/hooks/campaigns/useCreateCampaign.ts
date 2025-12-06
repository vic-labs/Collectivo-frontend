import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
	useSignAndExecuteTransaction,
	useCurrentAccount,
	useSuiClient,
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import * as campaignModule from '@/contract-sdk/collectivo/campaign';
import { NewCampaign } from '@collectivo/shared-types';
import { useRouter } from '@tanstack/react-router';
import { createEmptyCampaignCache } from '@/utils/campaigns';
import { calculateDepositWithFee, suiToMistSafe, mistToSui } from '@/lib/app-utils';
import { suiNftApiResponse } from '@/lib/app-utils';

type NftData = suiNftApiResponse & { listingPrice: number };

import { TOAST_DESCRIPTION_CLASSNAME } from '@/lib/constants';

const descriptionClassName = TOAST_DESCRIPTION_CLASSNAME;

export function useCreateCampaign() {
	const [isCreating, setIsCreating] = useState(false);
	const queryClient = useQueryClient();
	const client = useSuiClient();
	const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
	const currentAccount = useCurrentAccount();
	const router = useRouter();

	const createCampaign = useCallback(async (params: {
		description: string;
		minContribution: number;
		creatorContribution: number;
		nftData: NftData;
	}) => {
		if (!currentAccount) {
			throw new Error('Please connect your wallet to create a campaign');
		}

		// Validation
		if (!params.description || !params.minContribution || !params.creatorContribution) {
			throw new Error('Please fill all the required fields');
		}

		if (params.creatorContribution < params.minContribution) {
			throw new Error('Your contribution amount cannot be less than the minimum contribution');
		}

		// Build campaign object
		const campaign: NewCampaign = {
			id: '', // Will be set after transaction
			creator: currentAccount.address,
			description: params.description,
			nft: params.nftData,
			target: mistToSui(params.nftData?.listingPrice ?? 0) + 0.1,
			suiRaised: params.creatorContribution,
			minContribution: params.minContribution,
			status: 'Active',
			createdAt: new Date(),
		};

		// Build transaction
		const tx = new Transaction();

		const [creatorContributionCoin] = tx.splitCoins(tx.gas, [
			calculateDepositWithFee(suiToMistSafe(params.creatorContribution)),
		]);

		tx.add(
			campaignModule.create({
				arguments: {
					name: params.nftData.name,
					nftId: params.nftData.id,
					imageUrl: params.nftData.imageUrl,
					rank: params.nftData.rank,
					nftType: params.nftData.type,
					description: params.description,
					target: BigInt(params.nftData.listingPrice) + suiToMistSafe(0.1),
					minContribution: suiToMistSafe(params.minContribution),
					contribution: creatorContributionCoin,
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
				testResults.effects?.status?.error || 'Failed to create campaign'
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

		// Extract campaign ID from NewCampaignEvent
		const newCampaignEvent = finalResult.events?.find((event) =>
			event.type.includes('NewCampaignEvent')
		);

		const campaignId = (newCampaignEvent?.parsedJson as any)
			?.campaign_id as string;

		if (!campaignId) {
			throw new Error(
				'Could not extract campaign ID from transaction events'
			);
		}

		// Update cache with campaign ID
		const campaignWithId = { ...campaign, id: campaignId };
		queryClient.setQueryData(
			['campaign', campaignId],
			createEmptyCampaignCache({
				campaign: campaignWithId,
				txHash: result.digest,
			})
		);

		queryClient.invalidateQueries({
			queryKey: ['account-balance', currentAccount?.address],
		});

		// Navigate to the new campaign
		router.navigate({
			to: '/campaigns/$campaignId',
			params: { campaignId },
		});

		return {
			digest: result.digest,
			campaignId,
		};
	}, [client, currentAccount, signAndExecuteTransaction, queryClient, router]);

	const createCampaignWithToast = useCallback(async (params: {
		description: string;
		minContribution: number;
		creatorContribution: number;
		nftData: NftData;
	}) => {
		setIsCreating(true);

		try {
			toast.promise(createCampaign(params), {
				loading: 'Creating campaign...',
				success: () => ({
					message: 'Campaign created successfully',
				}),
				error: (error) => {
					if (error instanceof Error) {
						return {
							message: error.message,
						};
					}
					return {
						message: 'Failed to create campaign',
						description: 'If this error persists, please contact support',
						descriptionClassName,
					};
				},
			});
		} finally {
			setIsCreating(false);
		}
	}, [createCampaign]);

	return { createCampaign: createCampaignWithToast, isCreating };
}