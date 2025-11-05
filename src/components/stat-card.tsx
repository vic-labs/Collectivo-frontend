interface StatCardProps {
	title: string;
	value: string | number;
	suiIcon?: boolean;
}

export const StatCard = ({ title, value, suiIcon = false }: StatCardProps) => {
	return (
		<div className='bg-card rounded-lg p-4'>
			<p className='text-sm text-muted-foreground font-medium'>{title}</p>
			<p className='text-2xl font-bold flex items-center gap-2'>
				{suiIcon && <img src='/sui.svg' alt='SUI' className='size-5' />}
				{value}
			</p>
		</div>
	);
};
