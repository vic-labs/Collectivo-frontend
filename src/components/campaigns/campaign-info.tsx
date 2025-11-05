import { Campaign } from '@collectivo/shared-types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatAddress, formatSuiAmount } from '@/lib/app-utils';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { RankBadge } from '../rank-badge';
import { ViewAddressLink } from '../view-tx-link';
import { User } from 'lucide-react';

export const CampaignInfo = ({ campaign }: { campaign: Campaign }) => {
	const progressPercentage = (campaign.suiRaised / campaign.target) * 100;
	const account = useCurrentAccount();

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
						<RankBadge rank={campaign.nft.rank} />
					</div>
					<p className='text-muted-foreground leading-relaxed'>
						{campaign.description}
					</p>
				</div>

				{/* Progress */}
				<div className='space-y-3'>
					<div className='flex justify-between items-center'>
						<span className='text-sm font-medium text-muted-foreground'>
							{campaign.status === 'Completed' ? 'Funding Goal' : 'Funding Progress'}
						</span>
						<span className='text-lg font-bold'>
							{campaign.status === 'Completed' ? '100%' : `${progressPercentage.toFixed(1)}%`}
						</span>
					</div>
					<Progress value={campaign.status === 'Completed' ? 100 : progressPercentage} className='h-3' />
				</div>

				

				{/* Stats Grid */}
				<div className='grid grid-cols-2 gap-4 pt-2'>
					<div className='space-y-1'>
						<p className='text-xs text-muted-foreground uppercase tracking-wide'>
							Raised
						</p>
						<p className='text-2xl font-bold flex items-center gap-1'>
							<img src='/sui.svg' alt='sui' className='size-5' />
							{formatSuiAmount(campaign.suiRaised)}
						</p>
					</div>
					<div className='space-y-1'>
						<p className='text-xs text-muted-foreground uppercase tracking-wide'>
							Target
						</p>
						<p className='text-2xl font-bold flex items-center gap-1'>
							<img src='/sui.svg' alt='sui' className='size-5' />
							{campaign.target}
						</p>
					</div>
					<div className='space-y-1'>
						<p className='text-xs text-muted-foreground uppercase tracking-wide'>
							Min. Contribution
						</p>
						<p className='text-xl font-bold flex items-center gap-1'>
							<img src='/sui.svg' alt='sui' className='size-4' />
							{campaign.minContribution}
						</p>
					</div>
					<div className='space-y-1'>
						<p className='text-xs text-muted-foreground uppercase tracking-wide'>
							Creator
						</p>
	<p className='text-sm font-mono truncate flex items-center gap-2'>
		<User className='size-4 text-muted-foreground' />
		<ViewAddressLink 
			address={formatAddress(campaign.creator, account?.address)} 
			fullAddress={campaign.creator} 
		/>
	</p>
					</div>
				</div>
			</div>
		</div>
	);
};
