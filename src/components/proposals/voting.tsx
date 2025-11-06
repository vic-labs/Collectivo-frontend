import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { useVoteOnProposal } from '@/lib/hooks/proposals/useVoteOnProposal';

type VotingProps = {
	proposalId: string;
	campaignId: string;
	onVoteSuccess?: () => void;
};

export function Voting({ proposalId, campaignId, onVoteSuccess }: VotingProps) {
	const { vote, isVoting } = useVoteOnProposal(proposalId, campaignId);

	async function handleVote(voteType: 'Approval' | 'Rejection') {
		try {
			await vote(voteType);
			onVoteSuccess?.();
		} catch (error) {
			// Error handled by hook
		}
	}

	return (
		<div className='flex gap-2 pt-1'>
			<Button
				variant='default'
				size='sm'
				onClick={() => handleVote('Approval')}
				disabled={isVoting}
				className='flex-1 bg-green-600 hover:bg-green-700'>
				{isVoting ? <Loader className='animate-spin h-3 w-3' /> : '✓ Approve'}
			</Button>
			<Button
				variant='outline'
				size='sm'
				onClick={() => handleVote('Rejection')}
				disabled={isVoting}
				className='flex-1 border-red-200 hover:bg-red-50 dark:hover:bg-red-950'>
				{isVoting ? <Loader className='animate-spin h-3 w-3' /> : '✕ Reject'}
			</Button>
		</div>
	);
}
