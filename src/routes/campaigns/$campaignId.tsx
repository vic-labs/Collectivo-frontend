import { campaignQueryOptions } from '@/utils/campaigns';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { CampaignInfo } from '@/components/campaigns/campaign-info';
import { CampaignActions } from '@/components/campaigns/campaign-actions';
import { Proposals } from '@/components/proposals/proposals';
import { useCurrentAccount } from '@mysten/dapp-kit';

export const Route = createFileRoute('/campaigns/$campaignId')({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			campaignQueryOptions(params.campaignId)
		);
	},
});

function RouteComponent() {
	const { campaignId } = Route.useParams();
	const {
		data: { campaign, withdrawals, contributions, proposals },
	} = useSuspenseQuery(campaignQueryOptions(campaignId));
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
							showForCompleted={showProposals}
						/>
					)}

					<CampaignActions
						campaign={campaign}
						contributions={contributions}
						withdrawals={withdrawals}
						userAddress={account?.address}
					/>
				</div>
			</div>
		</div>
	);
}
