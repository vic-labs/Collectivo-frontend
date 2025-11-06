import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatAddress } from '@/lib/app-utils';
import { Proposal } from '@collectivo/shared-types';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Loader } from 'lucide-react';
import { CreateProposal } from './create-proposal';
import { Voting } from './voting';

type Props = {
	campaignId: string;
	nftPurchased: boolean;
	proposals: Proposal[];
	showForCompleted?: boolean;
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
	showForCompleted = false,
}: Props) {
	const currentAccount = useCurrentAccount();

	// Don't show if campaign is not completed
	if (!showForCompleted) {
		return null;
	}

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
			<CardHeader>
				<div className='flex justify-between items-center'>
					<div>
						<CardTitle className='text-2xl'>Governance</CardTitle>
						<CardDescription className='mt-1'>
							Vote on proposals to manage the co-owned NFT
						</CardDescription>
					</div>
					{currentAccount && <CreateProposal campaignId={campaignId} />}
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
					<div className='space-y-4'>
						{proposals.map((proposal) => (
							<Card key={proposal.id} className='border'>
								<CardHeader className='pb-3'>
									<div className='flex justify-between items-start gap-4'>
										<div className='flex-1'>
											<div className='flex items-center gap-2 mb-1'>
												<CardTitle className='text-base'>
													{formatProposalType(proposal.proposalType)}
												</CardTitle>
											</div>
											<CardDescription className='text-xs'>
												by{' '}
												{formatAddress(
													proposal.proposer,
													currentAccount?.address
												)}
											</CardDescription>
										</div>
										<Badge
											className={getProposalStatusColor(proposal.status)}
											variant='secondary'>
											{proposal.status}
										</Badge>
									</div>
								</CardHeader>
								<CardContent className='space-y-3'>
									{proposal.proposalType === 'List' && proposal.listPrice && (
										<div className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'>
											<span className='text-sm font-medium text-muted-foreground'>
												List Price
											</span>
											<div className='text-lg font-bold flex items-center gap-1'>
												<img src='/sui.svg' alt='sui' className='size-4' />
												{proposal.listPrice}
											</div>
										</div>
									)}
									<div className='flex items-center justify-between text-xs text-muted-foreground'>
										<span>
											Created{' '}
											{new Date(proposal.createdAt).toLocaleDateString()}
										</span>
									</div>
									{proposal.status === 'Active' && currentAccount && (
										<>
											<Separator />
											<Voting
												proposalId={proposal.id}
												campaignId={campaignId}
											/>
										</>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
