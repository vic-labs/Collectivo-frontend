import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
	useSignAndExecuteTransaction,
	useSuiClient,
	useCurrentAccount,
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import * as proposalModule from '@/contract-sdk/collectivo/proposal';

export function useVoteOnProposal(proposalId: string, campaignId: string) {
	const [isVoting, setIsVoting] = useState(false);
	const client = useSuiClient();
	const queryClient = useQueryClient();
	const account = useCurrentAccount();
	const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

	const vote = useCallback(async (voteType: 'Approval' | 'Rejection') => {
		if (!account) {
			throw new Error('Please connect your wallet to vote');
		}

		// Build transaction
		const tx = new Transaction();
		const proposalObj = tx.object(proposalId);
		const campaignObj = tx.object(campaignId);

		const voteTypeArg = voteType === 'Approval'
			? proposalModule.newApprovalVoteType()
			: proposalModule.newRejectionVoteType();

		tx.add(
			proposalModule.vote({
				arguments: {
					proposal: proposalObj,
					campaign: campaignObj,
					voteType: voteTypeArg,
				},
			})
		);

		// Execute transaction
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

		// Invalidate campaign query to refetch updated proposal data
		queryClient.invalidateQueries({
			queryKey: ['campaign', campaignId],
		});

		return {
			digest: result.digest,
			voteType,
		};
	}, [proposalId, campaignId, client, account, signAndExecuteTransaction, queryClient]);

	const voteWithToast = useCallback(async (voteType: 'Approval' | 'Rejection') => {
		setIsVoting(true);

		try {
			return await toast.promise(vote(voteType), {
				loading: `Casting your ${voteType.toLowerCase()} vote...`,
				success: (data) => ({
					message: `Successfully voted ${data.voteType === 'Approval' ? 'to approve' : 'to reject'} the proposal`,
				}),
				error: (error) => {
					if (error instanceof Error) {
						return {
							message: error.message,
						};
					}
					return {
						message: 'Failed to cast vote. Please try again.',
					};
				},
			});
		} finally {
			setIsVoting(false);
		}
	}, [vote]);

	return { vote: voteWithToast, isVoting };
}