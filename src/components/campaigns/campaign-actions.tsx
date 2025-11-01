import { Campaign, Contribution, Withdrawal } from '@collectivo/shared-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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
	// Calculate user's contribution and withdrawals
	const userContributions = contributions
		.filter((c) => c.contributor === userAddress)
		.reduce((sum, c) => sum + c.amount, 0);

	const userWithdrawals = withdrawals
		.filter((w) => w.contributor === userAddress)
		.reduce((sum, w) => sum + w.amount, 0);

	const userBalance = userContributions - userWithdrawals;
	const canWithdraw = userBalance > 0;
	const isActive = campaign.status === 'Active';

	return (
		<div className='space-y-6'>
			{/* Action Buttons */}
			<Card>
				<CardHeader>
					<CardTitle>Join the Collective</CardTitle>
					<p className='text-sm text-muted-foreground'>
						Fund together, own together
					</p>
				</CardHeader>
				<CardContent className='space-y-3'>
					<Button
						className='w-full'
						size='lg'
						disabled={!isActive || !userAddress}>
						{!userAddress
							? 'Connect Wallet'
							: !isActive
							? 'Campaign Ended'
							: 'Contribute'}
					</Button>
					<Button
						variant='outline'
						className='w-full'
						size='lg'
						disabled={!canWithdraw || !userAddress}>
						{!userAddress
							? 'Connect to Withdraw'
							: !canWithdraw
							? 'No Balance to Withdraw'
							: `Withdraw ${userBalance} SUI`}
					</Button>
					{userBalance > 0 && (
						<p className='text-xs text-center text-muted-foreground'>
							Your contribution: {userContributions} SUI | Withdrawn:{' '}
							{userWithdrawals} SUI
						</p>
					)}
				</CardContent>
			</Card>

			{/* Activity Feed */}
			<Card>
				<CardHeader>
					<CardTitle>Live Activity</CardTitle>
					<p className='text-sm text-muted-foreground'>
						Track contributions in real-time
					</p>
				</CardHeader>
				<CardContent>
					{contributions.length === 0 && withdrawals.length === 0 ? (
						<p className='text-sm text-muted-foreground text-center py-8'>
							No activity yet. Be the first to contribute!
						</p>
					) : (
						<div className='space-y-3'>
							{/* Combine and sort activities */}
							{[
								...contributions.map((c) => ({
									type: 'contribution' as const,
									amount: c.amount,
									address: c.contributor,
									date: new Date(c.contributedAt),
								})),
								...withdrawals.map((w) => ({
									type: 'withdrawal' as const,
									amount: w.amount,
									address: w.contributor,
									date: new Date(w.withdrawnAt),
								})),
							]
								.sort((a, b) => b.date.getTime() - a.date.getTime())
								.slice(0, 10)
								.map((activity, index) => (
									<div key={index}>
										<div className='flex items-center justify-between py-2'>
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
															? 'Contributed'
															: 'Withdrew'}{' '}
														{activity.amount} SUI
													</p>
													<p className='text-xs text-muted-foreground font-mono'>
														{activity.address.slice(0, 6)}...
														{activity.address.slice(-4)}
													</p>
												</div>
											</div>
											<p className='text-xs text-muted-foreground'>
												{formatTimeAgo(activity.date)}
											</p>
										</div>
										{index <
											Math.min(
												9,
												contributions.length + withdrawals.length - 1
											) && <Separator />}
									</div>
								))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
	const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

	if (seconds < 60) return 'just now';
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
	if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
	return `${Math.floor(seconds / 86400)}d ago`;
}
