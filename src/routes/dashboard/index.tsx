import { createFileRoute } from '@tanstack/react-router';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { userCampaignsQueryOptions } from '@/utils/campaigns';
import { useQuery } from '@tanstack/react-query';
import { CampaignCard } from '@/components/campaigns/campaign-card';

type UserCampaign = {
	id: string;
	creator: string;
	nft: any;
	description: string;
	target: string;
	suiRaised: string;
	minContribution: string;
	status: 'Active' | 'Completed';
	createdAt: Date;
	completedAt: Date | null;
	deletedAt: Date | null;
	walletAddress: string | null;
	contributions: Array<{
		id: number;
		campaignId: string;
		contributor: string;
		amount: string;
		contributedAt: Date;
		txDigest: string | null;
	}>;
	withdrawals: Array<{
		id: number;
		campaignId: string;
		contributor: string;
		amount: string;
		isFullWithdrawal: boolean;
		withdrawnAt: Date;
		txDigest: string | null;
	}>;
};

export const Route = createFileRoute('/dashboard/')({
	component: RouteComponent,
});

function RouteComponent() {
	const account = useCurrentAccount();

	const {
		data: userCampaigns,
		isLoading,
		error,
	} = useQuery({
		...userCampaignsQueryOptions(account?.address || ''),
		enabled: !!account?.address,
	});

	if (!account) {
		return (
			<div className='container mx-auto py-8'>
				<p className='text-muted-foreground'>
					Please connect your wallet to view your dashboard.
				</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className='container mx-auto py-8'>
				<p className='text-muted-foreground'>Loading your campaigns...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className='container mx-auto py-8'>
				<p className='text-destructive'>
					Error loading campaigns: {error.message}
				</p>
			</div>
		);
	}

	if (!userCampaigns || userCampaigns.length === 0) {
		return (
			<div className='container mx-auto py-8'>
				<p className='text-muted-foreground'>
					You haven't created or contributed to any campaigns yet.
				</p>
			</div>
		);
	}

	// Convert string numbers to CampaignCard expected format
	const convertToCampaignFormat = (userCampaign: UserCampaign) => ({
		id: userCampaign.id,
		creator: userCampaign.creator,
		nft: userCampaign.nft,
		description: userCampaign.description,
		target: parseFloat(userCampaign.target),
		suiRaised: parseFloat(userCampaign.suiRaised),
		minContribution: parseFloat(userCampaign.minContribution),
		status: userCampaign.status,
		createdAt: userCampaign.createdAt,
		completedAt: userCampaign.completedAt,
		deletedAt: userCampaign.deletedAt,
		walletAddress: userCampaign.walletAddress,
	});

	return (
		<div className='container mx-auto py-8'>
			<h1 className='text-2xl font-bold mb-6'>
				Your Campaigns ({userCampaigns.length})
			</h1>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{userCampaigns.map((userCampaign) => (
					<CampaignCard
						key={userCampaign.id}
						campaign={convertToCampaignFormat(userCampaign)}
					/>
				))}
			</div>
		</div>
	);
}
