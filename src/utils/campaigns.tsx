import { serializeCampaignsQuery } from '@/components/campaigns/Search-Filter';
import { API_ENDPOINT } from '@/lib/constants';
import { Campaign } from '@collectivo/shared-types';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

export const campaignsQueryParserschema = z.object({
	creator: z.string().optional(),
	isActive: z.boolean().optional().default(true),
	isCompleted: z.boolean().optional(),
	sortBy: z.enum(['createdAt', 'suiRaised']).optional().default('createdAt'),
	sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
	limit: z.coerce.number().optional().default(20),
	page: z.coerce.number().optional().default(1),
	search: z.string().optional(),
});

export const getCampaigns = createServerFn({ method: 'GET' })
	.inputValidator(campaignsQueryParserschema)
	.handler(async ({ data }) => {
		const query = serializeCampaignsQuery(data);
		const res = await fetch(`${API_ENDPOINT}/campaigns${query}`.trim());
		const response = (await res.json()) as {
			data: Campaign[];
			success: boolean;
			error: string | null;
		};
		if (!response.success) {
			throw new Error(response.error ?? 'Failed to fetch campaigns');
		}
		return response.data;
	});


	export const campaignsQueryOptions = (data: z.infer<typeof campaignsQueryParserschema>) => {
		return {
			queryKey: ['campaigns', data],
			queryFn: () => getCampaigns({ data }),
		};
	};


	export const getCampaign = createServerFn({ method: 'GET' })
		.inputValidator(z.object({ id: z.string() }))
		.handler(async ({ data }) => {
			const res = await fetch(`${API_ENDPOINT}/campaigns/${data.id}`.trim());
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