import { Badge } from './ui/badge';
import { formatNumberToHumanReadable } from '@/lib/app-utils';

export const RankBadge = ({ rank }: { rank: number }) => {
	return (
		<Badge
			variant='outline'
			className='text-sm text-primary font-bold border-2 px-2 shrink-0'>
			🥇 {formatNumberToHumanReadable(rank)}
		</Badge>
	);
};
