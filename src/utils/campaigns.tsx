
import { API_ENDPOINT } from '@/lib/constants';
import { Campaign, CampaignAPIQueryFilters, campaignsQueryParserschema } from '@collectivo/shared-types';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { objectToQueryString } from '@/lib/app-utils';


export const getCampaigns = createServerFn({ method: 'GET' })
	.inputValidator(campaignsQueryParserschema)
	.handler(async ({ data }) => {
		const query = objectToQueryString(data);

		const res = await fetch(`${API_ENDPOINT}/campaigns${query}`.trim());
		
		if (!res.ok) {
			console.error('❌ API error:', res.status, res.statusText);
			throw new Error(`Failed to fetch campaigns: ${res.status} ${res.statusText}`);
		}
		
		const response = (await res.json()) as {
			data: Campaign[];
			success: boolean;
			error: string | null;
		};
		
		if (!response.success) {
			throw new Error(response.error ?? 'Failed to fetch campaigns');
		}
		
		console.log('✅ Campaigns fetched:', response.data.length);
		return response.data;
	});


	export const campaignsQueryOptions = (data: CampaignAPIQueryFilters) => {
		// Only use search and limit in the queryKey to avoid refetching on filter/sort changes
		const queryKey = ['campaigns', { search: data.search, limit: data.limit, page: data.page }];
		
		return {
			queryKey,
			queryFn: () => getCampaigns({ data: { search: data.search, limit: data.limit } }),
		};
	};


	export const getCampaign = createServerFn({ method: 'GET' })
		.inputValidator(z.object({ id: z.string() }))
		.handler(async ({ data }) => {
			const res = await fetch(`${API_ENDPOINT}/campaigns/${data.id}`.trim());
			
			if (!res.ok) {
				console.error('❌ API error:', res.status, res.statusText);
				throw new Error(`Failed to fetch campaign: ${res.status} ${res.statusText}`);
			}
			
			const response = (await res.json()) as {
				data: Campaign;
				success: boolean;
				error: string | null;
			};
			if (!response.success) {
				throw new Error(response.error ?? 'Failed to fetch campaign');
			}
			return response.data;
		});



		export const campaignQueryOptions = (id: string) => {
			return {
				queryKey: ['campaign', id],
				queryFn: () => getCampaign({ data: { id } }),
			};
		};