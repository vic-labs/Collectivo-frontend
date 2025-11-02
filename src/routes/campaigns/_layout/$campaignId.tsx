import { campaignQueryOptions } from '@/utils/campaigns';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { CampaignInfo } from '@/components/campaigns/campaign-info';
import { CampaignActions } from '@/components/campaigns/campaign-actions';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Campaign, Contribution, Withdrawal } from '@collectivo/shared-types';

export type CampaignAndDetails = {
	campaign: Campaign;
	withdrawals: Withdrawal[];
	contributions: Contribution[];
};

export const Route = createFileRoute('/campaigns/_layout/$campaignId')({
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
		data: { campaign, withdrawals, contributions },
	} = useSuspenseQuery(campaignQueryOptions(campaignId));
	const account = useCurrentAccount();

	return (
		<div className='container mx-auto py-8 lg:px-4'>
			<div className='grid lg:grid-cols-2 lg:gap-20 max-w-7xl mx-auto gap-10'>
				{/* Left: Campaign Info */}
				<div>
					<CampaignInfo campaign={campaign} />
				</div>

				{/* Right: Actions & Activity */}
				<div className='lg:sticky lg:top-8 lg:self-start'>
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
