
import { SearchFilter } from '@/components/campaigns/search-filter';
import { campaignsQueryOptions } from '@/utils/campaigns';
import {  CampaignAPIQueryFilters } from '@collectivo/shared-types';
import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';


export const Route = createFileRoute('/campaigns')({
	validateSearch: (search) => {
		return search as CampaignAPIQueryFilters;
	},
	loaderDeps: ({ search: { search, limit, page } }) => ({ search, limit, page }),
	loader: async ({ context, deps }) => {
		// Only fetch based on search term, filtering/sorting happens on client
		const queryParams = {
			search: deps.search,
			limit: deps.limit,
			page: deps.page,
		} as CampaignAPIQueryFilters;

		await context.queryClient.ensureQueryData(campaignsQueryOptions(queryParams));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search = Route.useSearch();

	const queryParams = {
		search: search.search,
		limit: search.limit,
		page: search.page,
	} as CampaignAPIQueryFilters;

	const { data: campaigns = [] } = useSuspenseQuery(campaignsQueryOptions(queryParams));
	
	// Client-side filtering and sorting
	const filteredAndSorted = campaigns
		.filter((campaign) => {
			// Filter by active/completed status
			if (search.isActive && campaign.status !== 'Active') return false;
			if (!search.isActive && campaign.status !== 'Completed') return false;
			return true;
		})
		.sort((a, b) => {
			// Sort by selected field and order
			const field = search.sortBy || 'createdAt';
			const order = search.sortOrder || 'desc';
			
			const aValue = a[field];
			const bValue = b[field];
			
			if (aValue < bValue) return order === 'asc' ? -1 : 1;
			if (aValue > bValue) return order === 'asc' ? 1 : -1;
			return 0;
		});

	
	return (
		<section className='mt- py-10 bg-primary/5 h-screen -mx-[2.5%] px-[2.5%]'>
			<h1 className='text-2xl font-bold'>
				All Campaigns
			</h1>
			<p className='text-base text-gray-500'>
				Discover and co-own high-value NFTs through collective funding and transparent on-chain ownership on Sui.
			</p>
			<SearchFilter />
			<div className='mt-6'>
				<p className='text-sm text-muted-foreground'>
					Showing {filteredAndSorted.length} campaigns
				</p>
			</div>
		</section>
	);
}
