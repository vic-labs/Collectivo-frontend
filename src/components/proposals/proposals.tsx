import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { formatAddress } from '@/lib/app-utils';
import { calculateVoteStats } from '@/lib/utils/vote-utils';
import { Contribution, Proposal, Vote } from '@collectivo/shared-types';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Loader } from 'lucide-react';
import { ViewAddressLink } from '../view-tx-link';
import { CreateProposal } from './create-proposal';
import { Voting } from './voting';

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

function getProposalStatusColor(status: string): string {
	switch (status) {
		case 'Active':
			return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
		case 'Passed':
			return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
		case 'Rejected':
			return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
		default:
			return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
	}
}

function formatProposalType(type: 'List' | 'Delist'): string {
	return type === 'List' ? '📝 List NFT for Sale' : '🚫 Delist NFT';
}

export function Proposals({
	campaignId,
	nftPurchased,
	proposals,
	contributions,
	showForCompleted = false,
}: Props) {
	const currentAccount = useCurrentAccount();

	// Don't show if campaign is not completed
	if (!showForCompleted) {
		return null;
	}

	// Check if current user is a contributor
	const isContributor =
		currentAccount &&
		contributions.some(
			(c) => c.contributor.toLowerCase() === currentAccount.address.toLowerCase()
		);

	// Show message when campaign completed but NFT not purchased yet
	if (!nftPurchased) {
		return (
			<Card className='border-2 border-muted'>
				<CardHeader>
					<CardTitle className='text-2xl'>Governance</CardTitle>
					<CardDescription className='mt-1'>
						Governance features will be available after the NFT is purchased
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='text-center py-12 space-y-3'>
						<div className='flex items-center justify-center gap-2'>
							<Loader className='animate-spin h-5 w-5 text-muted-foreground' />
							<p className='text-muted-foreground font-medium'>
								Waiting for NFT purchase
							</p>
						</div>
						<p className='text-sm text-muted-foreground'>
							The campaign has been completed. Once the NFT is purchased, you'll
							be able to create and vote on proposals.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className='border-2'>
			<CardHeader className='pb-4'>
				<div className='flex justify-between items-center'>
					<div>
						<CardTitle className='text-2xl'>Governance</CardTitle>
						<CardDescription className='mt-1'>
							Vote on proposals to manage the co-owned NFT
						</CardDescription>
					</div>
					{currentAccount && isContributor && (
						<CreateProposal campaignId={campaignId} />
					)}
				</div>
			</CardHeader>
			<CardContent>
				{proposals.length === 0 ? (
					<div className='text-center py-12'>
						<p className='text-muted-foreground mb-2'>No proposals yet</p>
						<p className='text-sm text-muted-foreground'>
							Be the first to propose listing or delisting the NFT
						</p>
					</div>
				) : (
					<div className='space-y-3'>
						{proposals.map((p) => {
							const proposal = p as ProposalWithVotes;
							
							// Use the utility function to calculate vote stats
							const voteStats = calculateVoteStats({
								proposal,
								contributions,
								currentUserAddress: currentAccount?.address,
							});

							return (
								<Card key={proposal.id} className='border'>
									<CardHeader className='p-3 pb-2'>
										<div className='flex justify-between items-start gap-3'>
											<div className='flex-1'>
												<div className='flex items-center gap-2 mb-1'>
													<CardTitle className='text-base'>
														{formatProposalType(proposal.proposalType)}
													</CardTitle>
													{proposal.proposalType === 'List' &&
														proposal.listPrice && (
															<Badge
																variant='outline'
																className='ml-2 bg-muted/50 text-sm font-bold px-2 py-0.5'>
																<img
																	src='/sui.svg'
																	alt='sui'
																	className='size-3.5 mr-1.5'
																/>
																{proposal.listPrice}
															</Badge>
														)}
												</div>
												<CardDescription className='text-xs flex items-center gap-1'>
													<span>by</span>
													<ViewAddressLink
														address={formatAddress(
															proposal.proposer,
															currentAccount?.address
														)}
														fullAddress={proposal.proposer}
													/>
													<span>•</span>
													<span>
														{new Date(proposal.createdAt).toLocaleDateString()}
													</span>
												</CardDescription>
											</div>
											<Badge
												className={getProposalStatusColor(proposal.status)}
												variant='secondary'>
												{proposal.status}
											</Badge>
										</div>
									</CardHeader>
									<CardContent className='p-3 pt-0 space-y-3'>
										{/* Vote Visualization */}
										{voteStats.totalVotes > 0 ? (
											<div className='space-y-1.5'>
												<div className='flex h-1.5 w-full overflow-hidden rounded-full bg-secondary'>
													<div
														className='bg-green-500 transition-all duration-500 ease-in-out'
														style={{ width: `${voteStats.approvalPercentage}%` }}
													/>
													<div
														className='bg-red-500 transition-all duration-500 ease-in-out'
														style={{ width: `${voteStats.rejectionPercentage}%` }}
													/>
												</div>
												<div className='flex justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider'>
													<span className='flex items-center gap-1'>
														{voteStats.approvalVotes.length} Approved ({voteStats.approvalPercentage.toFixed(1)}% power)
													</span>
													<span className='flex items-center gap-1'>
														{voteStats.rejectionVotes.length} Rejected ({voteStats.rejectionPercentage.toFixed(1)}% power)
													</span>
												</div>
											</div>
										) : (
											<p className='text-xs text-muted-foreground italic'>
												No votes yet
											</p>
										)}

										{proposal.status === 'Active' && currentAccount && (
							<>
								{!isContributor ? (
									<p className='text-xs text-muted-foreground italic'>
										Only contributors can participate in governance
									</p>
								) : currentAccount.address === proposal.proposer ? (
									<p className='text-xs text-muted-foreground font-medium'>
										You created this proposal
									</p>
								) : voteStats.userVote ? (
									<div className='flex items-center gap-2 text-xs font-medium'>
										<span className='text-muted-foreground'>
											You voted:
										</span>
										<Badge
											variant='outline'
											className={
												voteStats.userVote.voteType === 'Approval'
													? 'text-green-600 border-green-200 bg-green-50'
													: 'text-red-600 border-red-200 bg-red-50'
											}>
											{voteStats.userVote.voteType}
										</Badge>
									</div>
								) : (
									<Voting
										proposalId={proposal.id}
										campaignId={campaignId}
									/>
								)}
							</>
						)}
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
