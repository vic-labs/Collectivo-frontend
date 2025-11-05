import { API_ENDPOINT } from '@/lib/constants';
import {
	Campaign,
	CampaignAPIQueryFilters,
	Contribution,
	NewCampaign,
	Withdrawal,
	campaignsQueryParserschema,
} from '@collectivo/shared-types';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { objectToQueryString } from '@/lib/app-utils';
import { QueryClient, queryOptions } from '@tanstack/react-query';

type CampaignAndDetails = {
	campaign: Campaign;
	withdrawals: Withdrawal[];
	contributions: Contribution[];
};

export const getCampaigns = createServerFn({ method: 'GET' })
	.inputValidator(campaignsQueryParserschema)
	.handler(async ({ data }) => {
		const { isActive, sortBy, sortOrder, ...backendData } = data;
		const query = objectToQueryString(backendData);
		const res = await fetch(`${API_ENDPOINT}/campaigns${query}`.trim());

		if (!res.ok) {
			console.error('❌ API error:', res.status, res.statusText);
			throw new Error(
				`Failed to fetch campaigns: ${res.status} ${res.statusText}`
			);
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
	// Only send search, limit, page to backend - backend doesn't filter by isActive
	const backendParams = {
		search: data.search,
		limit: data.limit,
		page: data.page,
	} as CampaignAPIQueryFilters;

	return queryOptions({
		queryKey: ['campaigns', backendParams],
		queryFn: () => getCampaigns({ data: backendParams }),
	});
};

export const getCampaign = createServerFn({ method: 'GET' })
	.inputValidator(z.object({ id: z.string() }))
	.handler(async ({ data }) => {
		const res = await fetch(`${API_ENDPOINT}/campaigns/${data.id}/details`);

		if (!res.ok) {
			console.error('❌ API error:', res.status, res.statusText);
			throw new Error(
				`Failed to fetch campaign: ${res.status} ${res.statusText}`
			);
		}

		const response = (await res.json()) as {
			data: CampaignAndDetails;
			success: boolean;
			error?: string;
		};
		if (!response.success) {
			throw new Error(response.error ?? 'Failed to fetch campaign');
		}
		return response.data;
	});

export const campaignQueryOptions = (id: string) => {
	return queryOptions({
		queryKey: ['campaign', id],
		queryFn: () => getCampaign({ data: { id } }),
	});
};

export const updateCampaignQueryData = (
	queryClient: QueryClient,
	campaignId: string,
	updates: {
		suiRaisedChange?: number; // Amount to add/subtract from suiRaised
		newContribution?: Contribution;
		newWithdrawal?: Withdrawal;
	}
) => {
	const queryKey = ['campaign', campaignId];

	queryClient.setQueryData(queryKey, (oldData: CampaignAndDetails) => {
		const updatedData = { ...oldData };

		// Update campaign suiRaised if change provided
		if (updates.suiRaisedChange !== undefined) {
			console.log('Updating suiRaised', updates.suiRaisedChange);
			updatedData.campaign = {
				...oldData.campaign,
				suiRaised: oldData.campaign.suiRaised + updates.suiRaisedChange,
			};
		}

		// Add new contribution if provided
		if (updates.newContribution) {
			updatedData.contributions = [
				...oldData.contributions,
				updates.newContribution,
			];
		}

		// Add new withdrawal if provided
		if (updates.newWithdrawal) {
			updatedData.withdrawals = [...oldData.withdrawals, updates.newWithdrawal];
		}

		return updatedData;
	});
};

export function createEmptyCampaignCache({
	campaign,
	txHash,
}: {
	campaign: NewCampaign;
	txHash: string;
}): CampaignAndDetails {
	return {
		campaign: {
			...campaign,
			suiRaised: campaign.suiRaised ?? 0,
			nft: campaign.nft ?? null,
			target: campaign.target ?? 0,
			minContribution: campaign.minContribution ?? 0,
			status: campaign.status ?? 'Active',
			createdAt: campaign.createdAt ?? new Date(),
			completedAt: null,
			deletedAt: null,
			walletAddress: null,
		},
		withdrawals: [],
		contributions: [
			{
				id: Date.now(),
				campaignId: campaign.id,
				contributor: campaign.creator,
				amount: 0,
				contributedAt: new Date(),
				txDigest: txHash,
			},
		],
	};
}
