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
import { Campaign } from '@collectivo/shared-types';
import { updateCampaignQueryData } from '@/utils/campaigns';
import { calculateDepositWithFee, formatSuiAmount } from '@/lib/app-utils';
import { ViewTxLink } from '@/components/view-tx-link';
import { MIST_PER_SUI } from '@mysten/sui/utils';



export function useContributeToCampaign(campaignId: string) {
	const [isContributing, setIsContributing] = useState(false);
	const queryClient = useQueryClient();
	const client = useSuiClient();
	const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
	const currentAccount = useCurrentAccount();

	const contributeToCampaign = useCallback(async (params: {
		amount: number;
		campaign: Campaign;
		minContribution: number;
		remainingAmount: number;
		balance?: number;
		userBalance?: number;
	}) => {
		if (!currentAccount) {
			throw new Error('Please connect your wallet to contribute');
		}

		// Validation
		// Allow contributions < minContribution if user already has sufficient balance
		if (!params.amount || (params.amount < params.minContribution && (!params.userBalance || params.userBalance < params.minContribution))) {
			throw new Error(`Amount must be at least ${params.minContribution} SUI for new contributors`);
		}

		if (params.balance && params.amount > params.balance) {
			throw new Error('You do not have enough SUI to contribute');
		}

		if (params.amount > params.remainingAmount) {
			throw new Error('You are contributing more than the remaining amount needed');
		}

		// Build transaction
		const tx = new Transaction();

		const [coin] = tx.splitCoins(tx.gas, [
			calculateDepositWithFee(getMist(params.amount)),
		]);

		tx.add(
			campaignModule.contribute({
				arguments: {
					campaign: campaignId,
					coin,
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
				testResults.effects?.status?.error || 'Failed to contribute'
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
			suiRaisedChange: params.amount,
			newContribution: {
				id: Date.now(),
				amount: params.amount,
				campaignId: campaignId,
				contributor: currentAccount.address,
				txDigest: result.digest,
				contributedAt: new Date(),
			},
		});

		queryClient.invalidateQueries({
			queryKey: ['account-balance', currentAccount?.address],
		});

		return {
			amount: params.amount,
			digest: result.digest,
		};
	}, [campaignId, client, currentAccount, signAndExecuteTransaction, queryClient]);

	const contributeToCampaignWithToast = useCallback(async (params: {
		amount: number;
		campaign: Campaign;
		minContribution: number;
		remainingAmount: number;
		balance?: number;
		userBalance?: number;
	}) => {
		setIsContributing(true);

		try {
			toast.promise(contributeToCampaign(params), {
				loading: `Contributing ${formatSuiAmount(params.amount)} SUI...`,
				success: (data) => ({
					message: `You just contributed ${formatSuiAmount(data.amount)} SUI`,
					action: React.createElement(ViewTxLink, { txHash: data.digest }),
				}),
				error: (error: any) => {
					if (error instanceof Error) {
						return {
							message: error.message,
						};
					}
					return {
						message: 'Failed to contribute. Please try again.',
					};
				},
			});
		} finally {
			setIsContributing(false);
		}
	}, [contributeToCampaign]);

	return { contributeToCampaign: contributeToCampaignWithToast, isContributing };
}

function getMist(amount: number) {
	const mistAmount = amount * Number(MIST_PER_SUI);
	return BigInt(Math.floor(mistAmount));
}