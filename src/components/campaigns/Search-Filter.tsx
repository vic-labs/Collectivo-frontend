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
import { ChevronDown } from 'lucide-react';

const typeOptions = [
	{ label: 'Active', value: 'active' },
	{ label: 'Completed', value: 'completed' },
];

const sortOptions = [
	{ label: 'Created At ↑', value: 'createdAt-asc' },
	{ label: 'Created At ↓', value: 'createdAt-desc' },
	{ label: 'SUI Raised ↑', value: 'suiRaised-asc' },
	{ label: 'SUI Raised ↓', value: 'suiRaised-desc' },
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
	const currentSortValue = `${sortBy}-${sortOrder}`;
	const currentLabel =
		sortOptions.find((option) => option.value === currentSortValue)?.label ||
		'Sort';

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='outline' className='flex items-center gap-2'>
					{currentLabel}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-44 mr-2'>
				<DropdownMenuRadioGroup
					value={currentSortValue}
					onValueChange={(value) => {
						const [field, order] = value.split('-') as [
							'createdAt' | 'suiRaised',
							'asc' | 'desc'
						];
						onSortChange(field, order);
					}}>
					{sortOptions.map((option) => (
						<DropdownMenuRadioItem key={option.value} value={option.value}>
							{option.label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
