import { calculateUserPower, formatTimeAgo } from '@/lib/app-utils';
import { useVoteOnProposal } from '@/lib/hooks/proposals/useVoteOnProposal';
import { useDeleteProposal } from '@/lib/hooks/proposals/useDeleteProposal';
import { calculateVoteStats } from '@/lib/utils/vote-utils';
import { Contribution, Proposal, Vote } from '@collectivo/shared-types';
import { useCurrentAccount } from '@mysten/dapp-kit';
import {
	CheckCircle2,
	Gavel,
	Loader,
	Megaphone,
	ThumbsDown,
	ThumbsUp,
	Timer,
	Trash2,
	TrendingUp,
} from 'lucide-react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ViewAddressLink } from '../view-tx-link';
import { CreateProposal } from './create-proposal';

type Props = {
	campaignId: string;
	nftPurchased: boolean;
	proposals: Proposal[];
	contributions: Contribution[];
	showForCompleted?: boolean;
};

type ProposalWithVotes = Proposal & {
	votes?: Vote[];
};

export function Proposals({
	campaignId,
	nftPurchased,
	proposals,
	contributions,
	showForCompleted = false,
}: Props) {
	const currentAccount = useCurrentAccount();

	// Don't show if campaign is not completed (unless forced)
	if (!showForCompleted) {
		return null;
	}

	// Calculate User Power
	const userPower = calculateUserPower(contributions, currentAccount?.address);

	// Check if current user is a contributor
	const isContributor = currentAccount
		? contributions.some(
				(c) =>
					c.contributor.toLowerCase() === currentAccount.address.toLowerCase()
			)
		: false;

	// Show message when campaign completed but NFT not purchased yet
	if (!nftPurchased) {
		return (
			<div className='bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden ring-1 ring-slate-900/5'>
				{/* Header */}
				<div className='p-6 bg-white border-b border-slate-100 relative overflow-hidden'>
					<div className='absolute top-0 right-0 p-4 opacity-[0.03]'>
						<Gavel size={80} className='text-slate-900' />
					</div>
					<div className='relative z-10'>
						<h3 className='font-bold text-xl flex items-center gap-2 text-slate-900'>
							<Gavel size={20} className='text-primary' />
							Governance
						</h3>
						<p className='text-slate-500 text-sm mt-1'>
							Governance features will be unlocked after NFT purchase
						</p>
					</div>
				</div>
				<div className='p-12 text-center space-y-3 bg-slate-50'>
					<div className='flex items-center justify-center gap-2'>
						<Loader className='animate-spin h-5 w-5 text-slate-400' />
						<p className='text-slate-500 font-medium'>
							Waiting for NFT purchase
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden ring-1 ring-slate-900/5'>
			{/* Header */}
			<div className='p-6 bg-white border-b border-slate-100 relative overflow-hidden'>
				{/* Header Actions (Create Proposal) */}
				{currentAccount && isContributor && (
					<div className='absolute top-6 right-6 z-20'>
						<CreateProposal campaignId={campaignId} />
					</div>
				)}

				<div className='absolute top-0 right-0 p-4 opacity-[0.03]'>
					<Gavel size={80} className='text-slate-900' />
				</div>
				<div className='relative z-10'>
					<h3 className='font-bold text-xl flex items-center gap-2 text-slate-900'>
						<Gavel size={20} className='text-primary' />
						Governance
					</h3>
					<p className='text-slate-500 text-sm mt-1'>
						Vote on proposals to manage the asset
					</p>
				</div>

				{/* User Stats */}
				<div className='mt-6 flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 w-fit'>
					<div>
						<div className='text-[10px] text-slate-400 font-bold uppercase tracking-wider'>
							Your Power
						</div>
						<div className='text-primary font-bold text-lg'>
							{userPower.toFixed(1)}%
						</div>
					</div>
					<div className='w-px h-8 bg-slate-200'></div>
					<div>
						<div className='text-[10px] text-slate-400 font-bold uppercase tracking-wider'>
							Delegated
						</div>
						<div className='text-slate-900 font-bold text-lg'>0%</div>
					</div>
				</div>
			</div>

			<div className='p-4 space-y-4 bg-slate-50 min-h-[300px]'>
				{proposals.length === 0 ? (
					<div className='text-center py-12'>
						<p className='text-slate-400 mb-2'>No proposals yet</p>
						<p className='text-sm text-slate-500'>
							Be the first to propose listing or delisting the NFT
						</p>
					</div>
				) : (
					proposals.map((p) => {
						const proposal = p as ProposalWithVotes;
						const voteStats = calculateVoteStats({
							proposal,
							contributions,
							currentUserAddress: currentAccount?.address,
						});

						return (
							<ProposalCard
								key={proposal.id}
								proposal={proposal}
								voteStats={voteStats}
								campaignId={campaignId}
								currentAccount={currentAccount}
								isContributor={isContributor}
							/>
						);
					})
				)}
			</div>
		</div>
	);
}

function ProposalCard({
	proposal,
	voteStats,
	campaignId,
	currentAccount,
	isContributor,
}: {
	proposal: ProposalWithVotes;
	voteStats: any;
	campaignId: string;
	currentAccount: any;
	isContributor: boolean;
}) {
	const { vote, isVoting } = useVoteOnProposal(proposal.id, campaignId);
	const { deleteProposal, isDeleting } = useDeleteProposal({
		proposalId: proposal.id,
		campaignId,
	});
	const { totalVotes, approvalPercentage, rejectionPercentage } = voteStats;
	const isCreator = currentAccount?.address === proposal.proposer;

	const handleVote = async (voteType: 'Approval' | 'Rejection') => {
		try {
			await vote(voteType);
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<div className='bg-white p-5 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100 hover:border-blue-200 transition-all group'>
			{/* Proposal Header */}
			<div className='flex justify-between items-start mb-4'>
				<div className='flex items-start gap-3'>
					<div
						className={`p-2.5 rounded-xl ${
							proposal.proposalType === 'List'
								? 'bg-emerald-50 text-emerald-600'
								: 'bg-blue-50 text-blue-600'
						}`}>
						{proposal.proposalType === 'List' ? (
							<TrendingUp size={20} />
						) : (
							<Megaphone size={20} />
						)}
					</div>
					<div>
						<h4 className='font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors'>
							{proposal.proposalType === 'List'
								? 'List NFT for Sale'
								: 'Delist NFT'}
						</h4>
						<div className='flex items-center gap-2 mt-1'>
							<span className='text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 flex items-center gap-1'>
								<ViewAddressLink
									address={`@${proposal.id.slice(0, 6).toUpperCase()}`}
									fullAddress={proposal.id}
								/>
								{currentAccount?.address === proposal.proposer && (
									<span className='text-primary font-bold ml-1'>(You)</span>
								)}
							</span>
							<span className='text-xs text-slate-500'>
								{formatTimeAgo(new Date(proposal.createdAt))}
							</span>
						</div>
					</div>
				</div>
				{proposal.status === 'Passed' ? (
					<div className='flex items-center gap-1 pl-2 pr-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-full border border-green-100'>
						<CheckCircle2 size={12} /> Passed
					</div>
				) : proposal.status === 'Rejected' ? (
					<div className='flex items-center gap-1 pl-2 pr-3 py-1 bg-red-50 text-red-700 text-[10px] font-bold uppercase rounded-full border border-red-100'>
						<ThumbsDown size={12} /> Rejected
					</div>
				) : (
					<div className='flex items-center gap-1 pl-2 pr-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded-full border border-blue-100 animate-pulse'>
						<Timer size={12} /> Active
					</div>
				)}
			</div>

			{/* Description/Value */}
			{proposal.listPrice && (
				<div className='mb-4 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between items-center'>
					<span className='font-semibold text-slate-500'>Proposed Price</span>
					<span className='font-bold text-slate-900 flex items-center gap-1'>
						<img src='/sui.svg' alt='sui' className='size-3.5' />
						{proposal.listPrice} SUI
					</span>
				</div>
			)}

			{/* Voting Progress */}
			<div className='mb-4'>
				<div className='flex justify-between text-[10px] font-bold text-slate-500 mb-1.5'>
					<span>Votes</span>
					<span>{totalVotes} Total</span>
				</div>
				<div className='h-2 w-full rounded-full overflow-hidden flex bg-slate-100'>
					<div
						className='bg-emerald-500 h-full transition-all duration-500'
						style={{ width: `${approvalPercentage}%` }}></div>
					<div
						className='bg-rose-500 h-full transition-all duration-500'
						style={{ width: `${rejectionPercentage}%` }}></div>
				</div>
				<div className='flex justify-between mt-1.5 text-[10px] font-medium text-slate-400'>
					<span className='flex items-center gap-1 text-emerald-600'>
						<ThumbsUp size={10} /> {approvalPercentage.toFixed(0)}%
					</span>
					<span className='flex items-center gap-1 text-rose-600'>
						{rejectionPercentage.toFixed(0)}% <ThumbsDown size={10} />
					</span>
				</div>
			</div>

			{/* Action */}
			{proposal.status === 'Active' ? (
				<>
					{!isContributor ? (
						<div className='text-center pt-3 border-t border-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-widest'>
							Only contributors can vote
						</div>
					) : voteStats.userVote ? (
						<div className='text-center pt-3 border-t border-slate-50'>
							<span
								className={`text-xs font-bold ${
									voteStats.userVote.voteType === 'Approval'
										? 'text-emerald-600'
										: 'text-rose-600'
								}`}>
								You voted {voteStats.userVote.voteType}
							</span>
						</div>
					) : (
						<div className='grid grid-cols-2 gap-2 mt-2'>
							<button
								onClick={() => handleVote('Approval')}
								disabled={isVoting}
								className='py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1'>
								{isVoting ? (
									<Loader className='h-3 w-3 animate-spin' />
								) : (
									'Vote For'
								)}
							</button>
							<button
								onClick={() => handleVote('Rejection')}
								disabled={isVoting}
								className='py-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1'>
								{isVoting ? (
									<Loader className='h-3 w-3 animate-spin' />
								) : (
									'Vote Against'
								)}
							</button>
						</div>
					)}
				</>
			) : (
				<div className='text-center pt-3 border-t border-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-widest'>
					Voting Closed
				</div>
			)}

			{/* Delete Action for Creator */}
			{isCreator && proposal.status === 'Active' && approvalPercentage < 50 && rejectionPercentage < 50 && (
				<div className='pt-3 mt-3 border-t border-slate-50'>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<button
								disabled={isDeleting}
								className='w-full py-2 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 group/delete'
								title='Delete Proposal'>
								{isDeleting ? (
									<Loader className='animate-spin h-3 w-3' />
								) : (
									<>
										<Trash2
											size={14}
											className='group-hover/delete:scale-110 transition-transform'
										/>
										<span>Delete Proposal</span>
									</>
								)}
							</button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete Proposal</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to delete this proposal? This action
									cannot be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={(e) => {
										e.preventDefault();
										deleteProposal();
									}}
									className='bg-red-600 hover:bg-red-700 text-white'>
									{isDeleting ? (
										<Loader className='h-4 w-4 animate-spin' />
									) : (
										'Delete'
									)}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			)}
		</div>
	);
}
