import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader } from 'lucide-react';
import {
	useSignAndExecuteTransaction,
	useCurrentAccount,
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import * as proposal from '@/contract-sdk/collectivo/proposal';
import { updateCampaignQueryData } from '@/utils/campaigns';
import { Proposal } from '@collectivo/shared-types';

type Props = {
	campaignId: string;
	nftPurchased: boolean;
	proposals: Proposal[];
	showForCompleted?: boolean;
};

export function Proposals({
	campaignId,
	nftPurchased,
	proposals,
	showForCompleted = false,
}: Props) {
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [proposalType, setProposalType] = useState<'List' | 'Delist'>('List');
	const [listPrice, setListPrice] = useState('');
	const queryClient = useQueryClient();
	const { mutateAsync: signAndExecuteTransaction } =
		useSignAndExecuteTransaction();
	const currentAccount = useCurrentAccount();

	const createProposalMutation = useMutation({
		mutationFn: async ({
			type,
			price,
		}: {
			type: 'List' | 'Delist';
			price?: string;
		}) => {
			if (!currentAccount) throw new Error('Wallet not connected');

			const tx = new Transaction();
			const campaignObj = tx.object(campaignId);

			let proposalTypeArg;
			if (type === 'List') {
				if (!price) throw new Error('Price is required for List proposals');
				proposalTypeArg = proposal.newListProposalType({
					arguments: [parseInt(price) * 1_000_000], // Convert to MIST
				});
			} else {
				proposalTypeArg = proposal.newDelistProposalType();
			}

			tx.moveCall(
				proposal.create({
					arguments: [campaignObj, proposalTypeArg],
				}) as any
			);

			const result = await signAndExecuteTransaction({
				transaction: tx,
			});

			return result;
		},
		onSuccess: (result) => {
			toast.success('Proposal created successfully!');
			setCreateDialogOpen(false);
			setListPrice('');

			// Add optimistic update
			const newProposal: Proposal = {
				id: result.digest, // Use tx digest as temporary ID
				campaignId: campaignId,
				proposer: currentAccount?.address || '',
				proposalType: proposalType,
				listPrice:
					proposalType === 'List' ? parseInt(listPrice) * 1_000_000 : null,
				status: 'Active',
				createdAt: new Date(),
				endedAt: null,
				deletedAt: null,
			};

			updateCampaignQueryData(queryClient, campaignId, {
				newProposal,
			});
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const voteMutation = useMutation({
		mutationFn: async ({
			proposalId,
			voteType,
		}: {
			proposalId: string;
			voteType: 'Approval' | 'Rejection';
		}) => {
			if (!currentAccount) throw new Error('Wallet not connected');

			const tx = new Transaction();
			const proposalObj = tx.object(proposalId);
			const campaignObj = tx.object(campaignId);

			let voteTypeArg;
			if (voteType === 'Approval') {
				voteTypeArg = proposal.newApprovalVoteType();
			} else {
				voteTypeArg = proposal.newRejectionVoteType();
			}

			tx.moveCall(
				proposal.vote({
					arguments: [proposalObj, campaignObj, voteTypeArg],
				}) as any
			);

			const result = await signAndExecuteTransaction({
				transaction: tx,
			});

			return result;
		},
		onSuccess: () => {
			toast.success('Vote cast successfully!');
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const handleCreateProposal = () => {
		if (proposalType === 'List' && !listPrice) {
			toast.error('Price is required for List proposals');
			return;
		}
		createProposalMutation.mutate({ type: proposalType, price: listPrice });
	};

	const handleVote = (
		proposalId: string,
		voteType: 'Approval' | 'Rejection'
	) => {
		voteMutation.mutate({ proposalId, voteType });
	};

	const getStatusColor = (status: string) => {
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
	};

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
					{currentAccount && (
						<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
							<DialogTrigger asChild>
								<Button size='sm'>New Proposal</Button>
							</DialogTrigger>
							<DialogContent className='sm:max-w-md'>
								<DialogHeader>
									<DialogTitle>Create Proposal</DialogTitle>
									<DialogDescription>
										Propose to list or delist the NFT on the marketplace
									</DialogDescription>
								</DialogHeader>
								<div className='space-y-4 pt-4'>
									<div className='space-y-3'>
										<Label>Proposal Type</Label>
										<div className='grid grid-cols-2 gap-3'>
											<Button
												variant={
													proposalType === 'List' ? 'default' : 'outline'
												}
												onClick={() => setProposalType('List')}
												className='w-full'>
												List NFT
											</Button>
											<Button
												variant={
													proposalType === 'Delist' ? 'default' : 'outline'
												}
												onClick={() => setProposalType('Delist')}
												className='w-full'>
												Delist NFT
											</Button>
										</div>
									</div>
									{proposalType === 'List' && (
										<div className='space-y-2'>
											<Label htmlFor='price'>List Price (SUI)</Label>
											<Input
												id='price'
												type='number'
												step='0.01'
												min='0'
												placeholder='0.00'
												value={listPrice}
												onChange={(e) => setListPrice(e.target.value)}
											/>
										</div>
									)}
									<Button
										onClick={handleCreateProposal}
										disabled={createProposalMutation.isPending}
										className='w-full'>
										{createProposalMutation.isPending && (
											<Loader className='animate-spin mr-2 h-4 w-4' />
										)}
										Create Proposal
									</Button>
								</div>
							</DialogContent>
						</Dialog>
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
					<div className='space-y-4'>
						{proposals.map((proposal: any) => (
							<Card key={proposal.id} className='border'>
								<CardHeader className='pb-3'>
									<div className='flex justify-between items-start gap-4'>
										<div className='flex-1'>
											<div className='flex items-center gap-2 mb-1'>
												<CardTitle className='text-base'>
													{proposal.proposalType === 'List'
														? '📝 List NFT for Sale'
														: '🚫 Delist NFT'}
												</CardTitle>
											</div>
											<CardDescription className='text-xs'>
												by {proposal.proposer.slice(0, 6)}...
												{proposal.proposer.slice(-4)}
											</CardDescription>
										</div>
										<Badge
											className={getStatusColor(proposal.status)}
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
											<span className='text-lg font-bold'>
												{(proposal.listPrice / 1_000_000).toFixed(2)} SUI
											</span>
										</div>
									)}
									<div className='flex items-center justify-between text-xs text-muted-foreground'>
										<span>
											Created{' '}
											{new Date(proposal.createdAt).toLocaleDateString()}
										</span>
										{proposal.votes && (
											<span>
												{proposal.votes.length} vote
												{proposal.votes.length !== 1 ? 's' : ''}
											</span>
										)}
									</div>
									{proposal.status === 'Active' && currentAccount && (
										<>
											<Separator />
											<div className='flex gap-2 pt-1'>
												<Button
													variant='default'
													size='sm'
													onClick={() => handleVote(proposal.id, 'Approval')}
													disabled={voteMutation.isPending}
													className='flex-1 bg-green-600 hover:bg-green-700'>
													{voteMutation.isPending ? (
														<Loader className='animate-spin h-3 w-3' />
													) : (
														'✓ Approve'
													)}
												</Button>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleVote(proposal.id, 'Rejection')}
													disabled={voteMutation.isPending}
													className='flex-1 border-red-200 hover:bg-red-50'>
													{voteMutation.isPending ? (
														<Loader className='animate-spin h-3 w-3' />
													) : (
														'✕ Reject'
													)}
												</Button>
											</div>
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
