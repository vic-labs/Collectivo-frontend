import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
	useSignAndExecuteTransaction,
	useCurrentAccount,
	useSuiClient,
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import * as proposalModule from '@/contract-sdk/collectivo/proposal';
import { Proposal } from '@collectivo/shared-types';
import { updateCampaignQueryData } from '@/utils/campaigns';
import { suiToMistSafe } from '@/lib/app-utils';

const descriptionClassName = 'text-gray-800! dark:text-gray-200!';

export function useCreateProposal(campaignId: string) {
	const [isCreating, setIsCreating] = useState(false);
	const queryClient = useQueryClient();
	const client = useSuiClient();
	const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
	const currentAccount = useCurrentAccount();

	const createProposal = useCallback(async (params: {
		proposalType: 'List' | 'Delist';
		listPrice?: number;
	}) => {
		if (!currentAccount) {
			throw new Error('Please connect your wallet to create a proposal');
		}

		// Validation
		if (params.proposalType === 'List' && (!params.listPrice || params.listPrice <= 0)) {
			throw new Error('Please enter a valid list price');
		}

		// Build transaction
		const tx = new Transaction();
		let proposalTypeArg;

		if (params.proposalType === 'List') {
			proposalTypeArg = proposalModule.newListProposalType({
				arguments: {
					price: suiToMistSafe(params.listPrice!),
				},
			});
		} else {
			proposalTypeArg = proposalModule.newDelistProposalType();
		}

		tx.add(
			proposalModule.create({
				arguments: {
					campaign: campaignId,
					proposalType: proposalTypeArg,
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
				testResults.effects?.status?.error || 'Failed to create proposal'
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
		const newProposal: Proposal = {
			id: result.digest,
			campaignId: campaignId,
			proposer: currentAccount.address,
			proposalType: params.proposalType,
			listPrice: params.proposalType === 'List' && params.listPrice ? params.listPrice : null,
			status: 'Active',
			createdAt: new Date(),
			endedAt: null,
			deletedAt: null,
		};

		updateCampaignQueryData(queryClient, campaignId, {
			newProposal,
		});

		return {
			digest: result.digest,
		};
	}, [campaignId, client, currentAccount, signAndExecuteTransaction, queryClient]);

	const createProposalWithToast = useCallback(async (params: {
		proposalType: 'List' | 'Delist';
		listPrice?: number;
	}) => {
		setIsCreating(true);

		try {
			return await toast.promise(createProposal(params), {
				loading: 'Creating proposal...',
				success: () => ({
					message: 'Proposal created successfully',
				}),
				error: (error) => {
					if (error instanceof Error) {
						return {
							message: error.message,
						};
					}
					return {
						message: 'Failed to create proposal',
						description: 'If this error persists, please contact support',
						descriptionClassName,
					};
				},
			});
		} finally {
			setIsCreating(false);
		}
	}, [createProposal]);

	return { createProposal: createProposalWithToast, isCreating };
}