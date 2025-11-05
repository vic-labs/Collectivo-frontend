import { Campaign, Contribution, Withdrawal } from '@collectivo/shared-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { formatAddress, formatSuiAmount } from '@/lib/app-utils';
import { Withdraw } from './withdraw';
import { ConnectButton } from '@mysten/dapp-kit';
import { Contribute } from './contribute';
import { useNetwork } from '@/lib/hooks/useNetwork';
import { EXPLORER_TX_URL } from '@/lib/constants';

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
	// Calculate user's contribution and withdrawals
	const userContributions = contributions
		.filter((c) => c.contributor === userAddress)
		.reduce((sum, c) => sum + c.amount, 0);

	const userWithdrawals = withdrawals
		.filter((w) => w.contributor === userAddress)
		.reduce((sum, w) => sum + w.amount, 0);

	const userBalance = userContributions - userWithdrawals;
	const isActive = campaign.status === 'Active';

	return (
		<div className='space-y-6 sticky top-4 self-start'>
			{/* Action Buttons */}
			<Card>
				<CardHeader>
					<CardTitle>Ready to co-own?</CardTitle>
					<p className='text-sm text-muted-foreground'>
						Fund together, own together
					</p>
				</CardHeader>
				<CardContent className='space-y-3'>
					{isActive ? (
						userAddress ? (
							<Contribute campaign={campaign} />
						) : (
							<ConnectButton className='bg-primary! w-full text-white!' />
						)
					) : (
						<div className='text-center py-4'>
							<p className='text-lg font-semibold text-green-600'>Campaign Completed!</p>
							<p className='text-sm text-muted-foreground mt-1'>
								This campaign has successfully reached its funding goal.
							</p>
							{!campaign.nft.isPurchased && (
								<div className='flex items-center justify-center gap-2 mt-3'>
									<Spinner className='size-4' />
									<p className='text-sm font-medium text-yellow-600'>
										NFT pending purchase
									</p>
								</div>
							)}
						</div>
					)}
					{userAddress && isActive && (
						<Withdraw
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

			{/* Activity Feed */}
			<Card>
				<CardHeader>
					<CardTitle>Activity</CardTitle>
					<p className='text-sm text-muted-foreground'>
						Contributions and withdrawals
					</p>
				</CardHeader>
				<CardContent>
					{contributions.length === 0 && withdrawals.length === 0 ? (
						<p className='text-sm text-muted-foreground text-center py-8'>
							No activity yet. Be the first to contribute!
						</p>
					) : (
						<div className='space-y-3 max-h-[300px] overflow-y-scroll'>
							{/* Combine and sort activities */}
							{combineAndSortActivities(contributions, withdrawals).map(
								(activity, index) => (
									<div key={index}>
										<a
											href={EXPLORER_TX_URL({
												chain: network,
												txHash: activity.txHash || '',
											})}
											target='_blank'
											className='flex items-center justify-between py-2 hover:bg-primary/5 px-1 rounded-t-lg'>
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
												contributions.length + withdrawals.length - 1
											) && <Separator />}
									</div>
								)
							)}
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

function combineAndSortActivities(
	contributions: Contribution[],
	withdrawals: Withdrawal[]
) {
	const activities = [
		...contributions.map((c) => ({
			type: 'contribution' as const,
			amount: c.amount,
			address: c.contributor,
			date: new Date(c.contributedAt),
			txHash: c.txDigest,
		})),
		...withdrawals.map((w) => ({
			type: 'withdrawal' as const,
			amount: w.amount,
			address: w.contributor,
			date: new Date(w.withdrawnAt),
			txHash: w.txDigest,
		})),
	];
	return activities.sort((a, b) => b.date.getTime() - a.date.getTime());
}
