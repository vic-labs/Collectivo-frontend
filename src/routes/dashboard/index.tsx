import { CampaignCard } from '@/components/campaigns/campaign-card';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { userCampaignsQueryOptions } from '@/utils/campaigns';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/')({
	component: RouteComponent,
});

function RouteComponent() {
	const account = useCurrentAccount();
	const [createdStatus, setCreatedStatus] = useState<'Active' | 'Completed'>(
		'Active'
	);
	const [contributedStatus, setContributedStatus] = useState<
		'Active' | 'Completed'
	>('Active');

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

	// Filter campaigns
	const createdCampaigns = userCampaigns.filter(
		(c) => c.creator === account.address
	);
	const contributedCampaigns = userCampaigns.filter((c) =>
		c.contributions.some((contrib) => contrib.contributor === account.address)
	);

	const filteredCreated = createdCampaigns.filter(
		(c) => c.status === createdStatus
	);
	const filteredContributed = contributedCampaigns.filter(
		(c) => c.status === contributedStatus
	);

	// Calculate stats
	const totalCreated = createdCampaigns.length;
	const totalContributed = contributedCampaigns.length;
	const totalCreatedSUI = createdCampaigns.reduce(
		(sum, c) => sum + parseFloat(c.suiRaised),
		0
	);
	const totalContributedSUI = contributedCampaigns.reduce((sum, c) => {
		const userContributions = c.contributions
			.filter((contrib) => contrib.contributor === account.address)
			.reduce(
				(contribSum, contrib) => contribSum + parseFloat(contrib.amount),
				0
			);
		return sum + userContributions;
	}, 0);

	

	return (
		<div className='container mx-auto py-8'>
			<h1 className='text-2xl font-bold mb-6'>
				Your Campaigns ({userCampaigns.length})
			</h1>

			{/* Stats Overview */}
			<div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
				<StatCard title='Campaigns Created' value={totalCreated} />
				<StatCard title='Campaigns Contributed' value={totalContributed} />
				<StatCard title='SUI Raised' value={totalCreatedSUI.toFixed(2)} suiIcon />
				<StatCard title='SUI Contributed' value={totalContributedSUI.toFixed(2)} suiIcon />
			</div>

			<Tabs defaultValue='created' className='w-full'>
				<TabsList>
					<TabsTrigger value='created'>
						Created ({createdCampaigns.length})
					</TabsTrigger>
					<TabsTrigger value='contributed'>
						Contributed ({contributedCampaigns.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value='created' className='space-y-4'>
					<div className='flex gap-2'>
						<Button
							variant={createdStatus === 'Active' ? 'default' : 'outline'}
							onClick={() => setCreatedStatus('Active')}>
							Active
						</Button>
						<Button
							variant={createdStatus === 'Completed' ? 'default' : 'outline'}
							onClick={() => setCreatedStatus('Completed')}>
							Completed
						</Button>
					</div>

					{filteredCreated.length === 0 ? (
						<p className='text-muted-foreground'>
							No {createdStatus.toLowerCase()} campaigns created yet.
						</p>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{filteredCreated.map((userCampaign) => (
								<CampaignCard
									key={userCampaign.id}
									campaign={userCampaign}
								/>
							))}
						</div>
					)}
				</TabsContent>

				<TabsContent value='contributed' className='space-y-4'>
					<div className='flex gap-2'>
						<Button
							variant={contributedStatus === 'Active' ? 'default' : 'outline'}
							onClick={() => setContributedStatus('Active')}>
							Active
						</Button>
						<Button
							variant={
								contributedStatus === 'Completed' ? 'default' : 'outline'
							}
							onClick={() => setContributedStatus('Completed')}>
							Completed
						</Button>
					</div>

					{filteredContributed.length === 0 ? (
						<p className='text-muted-foreground'>
							No {contributedStatus.toLowerCase()} campaigns contributed to yet.
						</p>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{filteredContributed.map((userCampaign) => (
								<CampaignCard
									key={userCampaign.id}
									campaign={userCampaign}
								/>
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
