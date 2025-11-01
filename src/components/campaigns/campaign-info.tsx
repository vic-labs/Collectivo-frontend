import { Campaign } from '@collectivo/shared-types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const CampaignInfo = ({ campaign }: { campaign: Campaign }) => {
	const progressPercentage = (campaign.suiRaised / campaign.target) * 100;

	return (
		<div className='space-y-6'>
			{/* NFT Image */}
			<div className='relative rounded-lg overflow-hidden'>
				<img
					src={campaign.nft.imageUrl}
					alt={campaign.nft.name}
					className='w-full aspect-square object-cover'
				/>
				<Badge
					variant={campaign.status === 'Active' ? 'default' : 'secondary'}
					className='absolute top-4 right-4'>
					{campaign.status}
				</Badge>
			</div>

			{/* Campaign Details */}
			<div className='space-y-4'>
				<div>
					<div className='flex items-center gap-3 mb-2'>
						<h1 className='text-3xl font-bold'>{campaign.nft.name}</h1>
						<Badge className='text-sm font-bold bg-linear-to-r from-amber-500 to-orange-500 text-white border-0 px-3 py-1'>
							🥇 RANK {campaign.nft.rank}
						</Badge>
					</div>
					<p className='text-muted-foreground leading-relaxed'>
						{campaign.description}
					</p>
				</div>

				{/* Progress */}
				<div className='space-y-3'>
					<div className='flex justify-between items-center'>
						<span className='text-sm font-medium text-muted-foreground'>
							Funding Progress
						</span>
						<span className='text-lg font-bold'>
							{progressPercentage.toFixed(1)}%
						</span>
					</div>
					<Progress value={progressPercentage} className='h-3' />
				</div>

				{/* Stats Grid */}
				<div className='grid grid-cols-2 gap-4 pt-2'>
					<div className='space-y-1'>
						<p className='text-xs text-muted-foreground uppercase tracking-wide'>
							Raised
						</p>
						<p className='text-2xl font-bold'>{campaign.suiRaised} SUI</p>
					</div>
					<div className='space-y-1'>
						<p className='text-xs text-muted-foreground uppercase tracking-wide'>
							Target
						</p>
						<p className='text-2xl font-bold'>{campaign.target} SUI</p>
					</div>
					<div className='space-y-1'>
						<p className='text-xs text-muted-foreground uppercase tracking-wide'>
							Min. Contribution
						</p>
						<p className='text-xl font-bold'>{campaign.minContribution} SUI</p>
					</div>
					<div className='space-y-1'>
						<p className='text-xs text-muted-foreground uppercase tracking-wide'>
							Creator
						</p>
						<p className='text-sm font-mono truncate'>
							{campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
