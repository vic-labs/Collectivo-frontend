import {
	campaignsQueryParsers,
	SearchFilter
} from '@/components/campaigns/Search-Filter';
import { campaignsQueryOptions } from '@/utils/campaigns';
import { createFileRoute } from '@tanstack/react-router';
import { createLoader } from 'nuqs/server';

export const Route = createFileRoute('/campaigns')({
	loader: async ({ location, context }) => {
		const loaderSearchParams = createLoader(campaignsQueryParsers);
		const searchParams = loaderSearchParams(location.url);
		
		// Filter out null values and provide defaults for required fields
		const queryParams = {
			isActive: searchParams.isActive ?? true,
			sortBy: searchParams.sortBy ?? 'createdAt',
			sortOrder: searchParams.sortOrder ?? 'desc',
			limit: searchParams.limit ?? 10,
			page: searchParams.page ?? 1,
			...(searchParams.creator && { creator: searchParams.creator }),
			...(searchParams.isCompleted !== null && { isCompleted: searchParams.isCompleted }),
			...(searchParams.search && { search: searchParams.search }),
		};
		
		await context.queryClient.ensureQueryData(campaignsQueryOptions(queryParams));
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<section className='mt- py-10 bg-primary/5 h-screen -mx-[2.5%] px-[2.5%]'>
			<h1 className='text-2xl font-bold'>
				All Campaigns
			</h1>
			<p className='text-base text-gray-500'>
				Discover and co-own high-value NFTs through collective funding and transparent on-chain ownership on Sui.
			</p>
			<SearchFilter />
		</section>
	);
}
