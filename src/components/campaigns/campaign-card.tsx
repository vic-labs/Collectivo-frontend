import { CampaignWithContributors } from '@collectivo/shared-types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link } from '@tanstack/react-router';
import { formatSuiAmount, formatAddress } from '@/lib/app-utils';
import { RankBadge } from '../rank-badge';
import { Users, Wallet, CheckCircle } from 'lucide-react';

export const CampaignCard = ({
	campaign,
}: {
	campaign: CampaignWithContributors;
}) => {
	const progressPercentage = (campaign.suiRaised / campaign.target) * 100;
	const isCompleted = campaign.status === 'Completed';

	return (
		<Link
			to='/campaigns/$campaignId'
			params={{
				campaignId: campaign.id,
			}}>
			<Card className='overflow-hidden hover:shadow-lg transition-shadow p-0! w-full cursor-pointer'>
				<CardHeader className='p-0! -mb-6!'>
					<div className='relative'>
						<img
							loading='lazy'
							decoding='async'
							fetchPriority='low'
							src={campaign.nft.imageUrl}
							alt={campaign.nft.name}
							className='w-full object-cover'
						/>
						<Badge
							variant={campaign.status === 'Active' ? 'default' : 'secondary'}
							className='absolute top-2 right-2'>
							{campaign.status}
						</Badge>
					</div>
				</CardHeader>
				<CardContent className='px-4 pb-5'>
					<div className='flex items-center justify-between mb-1'>
						<h3 className='text-lg font-semibold line-clamp-1'>
							{campaign.nft.name}
						</h3>
						<RankBadge rank={campaign.nft.rank} />
					</div>
					<p className='text-base text-muted-foreground mb-4 line-clamp-2'>
						{campaign.description}
					</p>

					{isCompleted ? (
						<div className='space-y-3'>
							<div className='flex items-center justify-center gap-2 py-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800'>
								<CheckCircle className='h-5 w-5 text-green-600 dark:text-green-400' />
								<span className='font-semibold text-green-700 dark:text-green-300'>
									Campaign Completed
								</span>
							</div>

							<div className='flex items-center justify-between py-2 border-b'>
								<div className='flex items-center gap-2'>
									<Users className='h-4 w-4 text-muted-foreground' />
									<span className='text-sm text-muted-foreground'>
										Contributors
									</span>
								</div>
								<span className='font-bold text-lg'>
									{campaign.totalContributors}
								</span>
							</div>

							<div className='flex items-center justify-between py-2 border-b'>
								<span className='text-sm text-muted-foreground font-medium'>
									Total Raised
								</span>
								<span className='font-bold text-lg text-green-600 dark:text-green-400'>
									{formatSuiAmount(campaign.suiRaised)} SUI
								</span>
							</div>

							<div className='flex items-center justify-between py-2'>
								<div className='flex items-center gap-2'>
									<Wallet className='h-4 w-4 text-muted-foreground' />
									<span className='text-sm text-muted-foreground'>Creator</span>
								</div>
								<span className='font-mono text-sm font-medium'>
									{formatAddress(campaign.creator)}
								</span>
							</div>
						</div>
					) : (
						<div className='space-y-2'>
							<div className='flex justify-between text-sm'>
								<span className='text-muted-foreground font-medium'>
									Progress
								</span>
								<span className='font-bold'>
									{progressPercentage.toFixed(1)}%
								</span>
							</div>
							<Progress value={progressPercentage} className='h-2' />
							<div className='flex justify-between text-sm'>
								<span className='text-muted-foreground font-medium'>
									Raised
								</span>
								<span className='font-bold'>
									{formatSuiAmount(campaign.suiRaised)} SUI
								</span>
							</div>
							<div className='flex justify-between text-sm'>
								<span className='text-muted-foreground font-medium'>
									Target
								</span>
								<span className='font-bold'>
									{formatSuiAmount(campaign.target)} SUI
								</span>
							</div>
							<div className='flex justify-between text-sm'>
								<span className='text-muted-foreground font-medium'>
									Min. contribution
								</span>
								<span className='font-bold'>
									{formatSuiAmount(campaign.minContribution)} SUI
								</span>
							</div>
							<div className='flex items-center justify-center gap-2 pt-2 border-t text-sm'>
								<Users className='h-4 w-4 text-muted-foreground' />
								<span className='font-bold text-foreground'>
									{campaign.totalContributors}
								</span>
								<span className='text-muted-foreground'>
									contributor{campaign.totalContributors !== 1 ? 's' : ''}
								</span>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</Link>
	);
};
