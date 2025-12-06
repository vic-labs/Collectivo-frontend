import { Campaign, Contribution, Withdrawal } from '@collectivo/shared-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatAddress, formatSuiAmount, formatTimeAgo } from '@/lib/app-utils';
import { ContributeWithdraw } from './contribute-withdraw';
import { ConnectButton } from '@mysten/dapp-kit';
import { useNetwork } from '@/lib/hooks/useNetwork';
import { EXPLORER_TX_URL } from '@/lib/constants';
import { useState } from 'react';
import { CampaignAdminActions } from './admin-actions';

type CampaignActionsProps = {
	campaign: Campaign;
	contributions: Contribution[];
	withdrawals: Withdrawal[];
	userAddress?: string;
};

export const CampaignActions = ({
	campaign,
	contributions,
	withdrawals,
	userAddress,
}: CampaignActionsProps) => {
	const network = useNetwork();
	const [activityFilter, setActivityFilter] = useState<'all' | 'mine'>('all');

	// Calculate user's contribution and withdrawals
	const userContributions = contributions
		.filter((c) => c.contributor === userAddress)
		.reduce((sum, c) => sum + c.amount, 0);

	const userWithdrawals = withdrawals
		.filter((w) => w.contributor === userAddress)
		.reduce((sum, w) => sum + w.amount, 0);

	const userBalance = userContributions - userWithdrawals;
	const isActive = campaign.status === 'Active';

	// Filter activities based on selected tab
	const filteredContributions =
		activityFilter === 'mine' && userAddress
			? contributions.filter((c) => c.contributor === userAddress)
			: contributions;

	const filteredWithdrawals =
		activityFilter === 'mine' && userAddress
			? withdrawals.filter((w) => w.contributor === userAddress)
			: withdrawals;

	return (
		<div className='space-y-6'>
			{/* Campaign Status / Actions */}
			{isActive ? (
				<Card>
					<CardHeader>
						<CardTitle>Ready to co-own?</CardTitle>
						<p className='text-sm text-muted-foreground'>
							Fund together, own together
						</p>
						<CampaignAdminActions
							campaign={campaign}
							userAddress={userAddress}
						/>
					</CardHeader>
					<CardContent className='space-y-3'>
						{userAddress ? (
							<ContributeWithdraw
								mode='contribute'
								campaign={campaign}
								contributions={contributions}
								withdrawals={withdrawals}
								userAddress={userAddress}
							/>
						) : (
							<ConnectButton className='bg-primary! w-full text-white!' />
						)}
						{userAddress && (
							<ContributeWithdraw
								mode='withdraw'
								campaign={campaign}
								contributions={contributions}
								withdrawals={withdrawals}
								userAddress={userAddress}
							/>
						)}
						{userBalance > 0 && (
							<p className='text-xs text-center text-muted-foreground'>
								Your contribution: {formatSuiAmount(userContributions)} SUI |
								Withdrawn: {formatSuiAmount(userWithdrawals)} SUI
							</p>
						)}
					</CardContent>
				</Card>
			) : null}

			{/* Activity Feed */}
			<Card>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<div>
							<CardTitle>Activity</CardTitle>
							<p className='text-sm text-muted-foreground'>
								Recent contributions and withdrawals
							</p>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<Tabs
						value={activityFilter}
						onValueChange={(v) => setActivityFilter(v as 'all' | 'mine')}
						className='w-full'>
						<TabsList className='grid w-full grid-cols-2 mb-4'>
							<TabsTrigger value='all'>All</TabsTrigger>
							<TabsTrigger value='mine' disabled={!userAddress}>
								My Activity
							</TabsTrigger>
						</TabsList>
						<TabsContent value={activityFilter} className='mt-0'>
							{filteredContributions.length === 0 &&
							filteredWithdrawals.length === 0 ? (
								<p className='text-sm text-muted-foreground text-center py-8'>
									{activityFilter === 'mine'
										? 'You have no activity yet.'
										: 'No activity yet. Be the first to contribute!'}
								</p>
							) : (
								<div className='space-y-3 max-h-[400px] overflow-y-auto'>
									{combineAndSortActivities(
										filteredContributions,
										filteredWithdrawals
									).map((activity, index) => (
										<div key={index}>
											<a
												href={EXPLORER_TX_URL({
													chain: network,
													txHash: activity.txHash || '',
												})}
												target='_blank'
												className='flex items-center justify-between py-2 hover:bg-primary/5 px-1 rounded-t-lg transition-colors'>
												<div className='flex items-center gap-3'>
													<div
														className={`w-2 h-2 rounded-full ${
															activity.type === 'contribution'
																? 'bg-green-500'
																: 'bg-orange-500'
														}`}
													/>
													<div>
														<p className='text-sm font-medium'>
															{activity.type === 'contribution'
																? activity.isFirstContribution
																	? 'Created & Contributed'
																	: 'Contributed'
																: 'Withdrew'}{' '}
															{formatSuiAmount(activity.amount)} SUI
														</p>
														<p className='text-xs text-muted-foreground font-mono'>
															{formatAddress(activity.address, userAddress)}
														</p>
													</div>
												</div>
												<p className='text-xs text-muted-foreground'>
													{formatTimeAgo(activity.date)}
												</p>
											</a>
											{index <
												Math.min(
													9,
													filteredContributions.length +
														filteredWithdrawals.length -
														1
												) && <Separator />}
										</div>
									))}
								</div>
							)}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
};

function combineAndSortActivities(
	contributions: Contribution[],
	withdrawals: Withdrawal[]
) {
	type Activity = {
		type: 'contribution' | 'withdrawal';
		amount: number;
		address: string;
		date: Date;
		txHash: string | null;
		isFirstContribution: boolean;
	};

	const activities: Activity[] = [
		...contributions.map((c) => ({
			type: 'contribution' as const,
			amount: c.amount,
			address: c.contributor,
			date: new Date(c.contributedAt),
			txHash: c.txDigest,
			isFirstContribution: false,
		})),
		...withdrawals.map((w) => ({
			type: 'withdrawal' as const,
			amount: w.amount,
			address: w.contributor,
			date: new Date(w.withdrawnAt),
			txHash: w.txDigest,
			isFirstContribution: false,
		})),
	];

	const sorted = activities.sort((a, b) => b.date.getTime() - a.date.getTime());

	// Mark the last contribution (oldest) as the first contribution (campaign creation)
	const lastContribution = sorted
		.reverse()
		.find((a) => a.type === 'contribution');
	if (lastContribution) {
		lastContribution.isFirstContribution = true;
	}

	return sorted.reverse(); // Reverse back to newest first
}
