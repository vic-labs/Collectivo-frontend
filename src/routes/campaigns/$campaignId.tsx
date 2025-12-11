import { campaignQueryOptions } from '@/utils/campaigns';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CampaignInfo } from '@/components/campaigns/campaign-info';
import { CampaignActions } from '@/components/campaigns/campaign-actions';
import { Proposals } from '@/components/proposals/proposals';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { AlertCircle, Search } from 'lucide-react';

export const Route = createFileRoute('/campaigns/$campaignId')({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			campaignQueryOptions(params.campaignId)
		);
	},
	errorComponent: ErrorComponent,
});

function RouteComponent() {
	const { campaignId } = Route.useParams();
	const { data: campaignDetails } = useSuspenseQuery(campaignQueryOptions(campaignId));
	const { campaign, contributions, withdrawals, proposals } = campaignDetails;
	const account = useCurrentAccount();

	// Show proposals for completed campaigns
	const showProposals = campaign.status === 'Completed';

	return (
		<div className='container mx-auto py-8 lg:px-4'>
			<div className='grid lg:grid-cols-2 lg:gap-20 max-w-7xl mx-auto gap-10'>
				{/* Left: Campaign Info */}
				<div className='space-y-8'>
					<CampaignInfo campaign={campaign} />
				</div>

				{/* Right: Actions & Activity - Sticky sidebar */}
				<div className='lg:sticky lg:top-8 lg:self-start space-y-6'>
					{/* Show Governance for completed campaigns */}
					{showProposals && (
						<Proposals
							campaignId={campaign.id}
							nftPurchased={campaign.nft.isPurchased}
							proposals={proposals}
							contributions={contributions}
							showForCompleted={showProposals}
						/>
					)}

					<CampaignActions
						campaignDetails={campaignDetails}
						userAddress={account?.address}
					/>
				</div>
			</div>
		</div>
	);
}

function ErrorComponent({ error }: { error: Error }) {
	const isNotFound = error.message.includes('Campaign not found');
	const navigate = useNavigate();

	return (
		<div className='container mx-auto py-8 lg:px-4'>
			<div className='flex items-center justify-center min-h-[60vh]'>
				<div className='text-center space-y-6 max-w-md'>
					<div className='space-y-4'>
						<div className='flex justify-center'>
							{isNotFound ? (
								<Search className='h-16 w-16 text-muted-foreground' />
							) : (
								<AlertCircle className='h-16 w-16 text-destructive' />
							)}
						</div>
						<h1 className='text-3xl font-bold text-foreground'>
							{isNotFound ? 'Campaign Not Found' : 'Something went wrong'}
						</h1>
						<p className='text-muted-foreground text-lg'>
							{isNotFound
								? "The campaign you're looking for doesn't exist or has been removed."
								: error.message}
						</p>
					</div>

					<div className='pt-4'>
						<button
							onClick={() =>
								navigate({
									to: '/campaigns',
									replace: true,
									search: undefined as any,
								})
							}
							className='inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors'>
							← Go Back
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
