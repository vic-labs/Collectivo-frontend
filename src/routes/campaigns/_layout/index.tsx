import { CampaignCard } from '@/components/campaigns/campaign-card';
import { CreateCampaign } from '@/components/campaigns/create-campaign';
import { SearchFilter } from '@/components/campaigns/search-filter';
import { campaignsQueryOptions } from '@/utils/campaigns';
import { CampaignAPIQueryFilters } from '@collectivo/shared-types';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/campaigns/_layout/')({
	validateSearch: (search) => {
		return search as CampaignAPIQueryFilters;
	},
	loaderDeps: ({
		search: { search, limit, page, isActive, sortBy, sortOrder },
	}) =>
		({
			search,
			limit,
			page,
			isActive,
			sortBy,
			sortOrder,
		} as CampaignAPIQueryFilters),
	loader: async ({ context, deps }) => {
		const campaigns = await context.queryClient.ensureQueryData(
			campaignsQueryOptions({
				search: deps.search,
				limit: deps.limit,
				page: deps.page,
			} as CampaignAPIQueryFilters)
		);
		return { campaigns, params: deps };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { params } = Route.useLoaderData();
	const { data: campaigns, error } = useQuery(campaignsQueryOptions(params));
	const account = useCurrentAccount();

	if (!campaigns) return <p>Campaigns not found</p>;
	if (error) return <p className='text-red-500'>Error: {error.message}</p>;
	// Client-side filtering and sorting
	const filteredAndSorted = campaigns
		.filter((campaign) => {
			// Filter by active/completed status
			// Default to true if undefined (matches SearchFilter default)
			const isActive = params.isActive ?? true;

			if (isActive) {
				return campaign.status === 'Active';
			}

			return campaign.status === 'Completed';
		})
		.sort((a, b) => {
			// Sort by selected field and order
			const field = params.sortBy || 'createdAt';
			const order = params.sortOrder || 'desc';

			const aValue = a[field];
			const bValue = b[field];

			if (aValue < bValue) return order === 'asc' ? -1 : 1;
			if (aValue > bValue) return order === 'asc' ? 1 : -1;
			return 0;
		});

	return (
		<>
			<div className='flex justify-between items-center '>
				<h1 className='text-2xl font-bold'>All Campaigns</h1>
				<div className='hidden lg:block'>{account && <CreateCampaign />}</div>
			</div>
			<SearchFilter />
			<div className='my-6'>
				<p className='text-base text-muted-foreground'>
					Showing <span className='font-bold'>{filteredAndSorted.length}</span>{' '}
					campaigns
				</p>
			</div>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-5'>
				{filteredAndSorted.map((campaign) => (
					<CampaignCard key={campaign.id} campaign={campaign} />
				))}
			</div>
		</>
	);
}
