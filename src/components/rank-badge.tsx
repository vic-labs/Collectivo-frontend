import { Badge } from './ui/badge';
import { formatNumberToHumanReadable } from '@/lib/app-utils';

export const RankBadge = ({ rank }: { rank: number }) => {
	return (
		<Badge className='text-sm font-bold bg-linear-to-r from-amber-500 to-orange-500 text-white border-0 px-2 shrink-0'>
			🥇 {formatNumberToHumanReadable(rank)}
		</Badge>
	);
};
