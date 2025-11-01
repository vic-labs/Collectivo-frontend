import { Input } from '@/components/ui/input';
import { debounce } from 'nuqs/server';
import { useQueryStates } from 'nuqs';
import {
	parseAsString,
	parseAsBoolean,
	parseAsInteger,
	parseAsStringLiteral,
} from 'nuqs';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronUp } from 'lucide-react';

const typeOptions = [
	{ label: 'Active', value: 'active' },
	{ label: 'Completed', value: 'completed' },
];

const sortByOptions = [
	{ label: 'Created At', value: 'createdAt' as const },
	{ label: 'SUI Raised', value: 'suiRaised' as const },
];

export const campaignsQueryParsers = {
	creator: parseAsString,
	isActive: parseAsBoolean.withDefault(true),
	sortBy: parseAsStringLiteral(['createdAt', 'suiRaised']).withDefault(
		'createdAt'
	),
	sortOrder: parseAsStringLiteral(['asc', 'desc']).withDefault('desc'),
	limit: parseAsInteger,
	page: parseAsInteger,
	search: parseAsString.withDefault('').withOptions({
		history: 'push',
		shallow: false,
		limitUrlUpdates: debounce(500),
	}),
};

export const SearchFilter = () => {
	const [filters, setFilters] = useQueryStates(campaignsQueryParsers, {
		history: 'push',
		shallow: true,
	});

	return (
		<div className='flex flex-wrap lg:flex-nowrap gap-2 max-w-3xl mt-5'>
			<Input
				className='bg-white'
				type='search'
				placeholder='Search NFT by name, ID or the::type'
				value={filters.search}
				onChange={(e) => setFilters({ search: e.target.value })}
			/>
			<div className='flex items-center gap-2'>
				<TypeFilter
					type={filters.isActive ? 'active' : 'completed'}
					setType={(type) => setFilters({ isActive: type === 'active' })}
				/>
				<SortFilter
					sortBy={filters.sortBy}
					sortOrder={filters.sortOrder}
					onSortChange={(sortBy, sortOrder) =>
						setFilters({ sortBy, sortOrder })
					}
				/>
			</div>
		</div>
	);
};

//pass the type filter as a prop from the parent component
function TypeFilter({
	type,
	setType,
}: {
	type: string;
	setType: (type: string) => void;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='outline'>
					{typeOptions.find((option) => option.value === type)?.label}
					<ChevronDown className='size-4' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-44 mr-2'>
				<DropdownMenuRadioGroup value={type} onValueChange={setType}>
					{typeOptions.map((option) => (
						<DropdownMenuRadioItem key={option.value} value={option.value}>
							{option.label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function SortFilter({
	sortBy,
	sortOrder,
	onSortChange,
}: {
	sortBy: 'createdAt' | 'suiRaised';
	sortOrder: 'asc' | 'desc';
	onSortChange: (
		sortBy: 'createdAt' | 'suiRaised',
		sortOrder: 'asc' | 'desc'
	) => void;
}) {
	const handleSortOrderToggle = () => {
		const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		onSortChange(sortBy, newOrder);
	};

	return (
		<div className='flex items-center'>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant='outline'
						className='flex items-center gap-2 rounded-r-none border-r-0'>
						{sortByOptions.find((option) => option.value === sortBy)?.label}
						<ChevronDown className='size-4' />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className='w-44 mr-2'>
					<DropdownMenuRadioGroup
						value={sortBy}
						onValueChange={(value) =>
							onSortChange(value as 'createdAt' | 'suiRaised', sortOrder)
						}>
						{sortByOptions.map((option) => (
							<DropdownMenuRadioItem key={option.value} value={option.value}>
								{option.label}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>
			<Button
				variant='outline'
				className='flex flex-col gap-0 rounded-l-none px-2 py-1 h-auto min-h-[36px]'
				onClick={handleSortOrderToggle}>
				<ChevronUp
					className={`size-3 -mb-1 ${
						sortOrder === 'asc' ? 'text-foreground' : 'text-muted-foreground/40'
					}`}
				/>
				<ChevronDown
					className={`size-3 -mt-1 ${
						sortOrder === 'desc'
							? 'text-foreground'
							: 'text-muted-foreground/40'
					}`}
				/>
			</Button>
		</div>
	);
}
