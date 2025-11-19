import { API_ENDPOINT } from '@/lib/constants';
import {
	CampaignAPIQueryFilters,
	CampaignWithContributors,
	Contribution,
	NewCampaign,
	Proposal,
	Withdrawal,
	campaignsQueryParserschema,
} from '@collectivo/shared-types';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { objectToQueryString } from '@/lib/app-utils';
import { QueryClient, queryOptions } from '@tanstack/react-query';

export const campaignNotFoundError = new Error('Campaign not found');

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
			data: CampaignWithContributors[];
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

			if (res.status === 404) {
				throw campaignNotFoundError;
			}

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
		newProposal?: Proposal;
		proposalId?: string;
		statusUpdate?: 'Active' | 'Passed' | 'Rejected';
	}
) => {
	const queryKey = ['campaign', campaignId];

	queryClient.setQueryData(queryKey, (oldData: CampaignAndDetails) => {
		const updatedData = { ...oldData };

		// Update campaign suiRaised if change provided
		if (updates.suiRaisedChange !== undefined) {
			console.log('Updating suiRaised', updates.suiRaisedChange);
			const newSuiRaised = oldData.campaign.suiRaised + updates.suiRaisedChange;
			updatedData.campaign = {
				...oldData.campaign,
				suiRaised: newSuiRaised,
			};

			// Check if campaign is now completed
			if (
				newSuiRaised >= oldData.campaign.target &&
				oldData.campaign.status === 'Active'
			) {
				updatedData.campaign.status = 'Completed';
				updatedData.campaign.completedAt = new Date();
			}
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

		// Add new proposal if provided
	if (updates.newProposal) {
		// Get the proposer's contribution to calculate voting weight
		const proposerContribution = oldData.contributions.find(
			(c) => c.contributor === updates.newProposal!.proposer
		);
		const votingWeight = proposerContribution ? proposerContribution.amount : 0;

		const proposalWithVotes = {
			...updates.newProposal,
			votes: [
				{
					id: Date.now(), // Temporary ID for optimistic update
					txDigest: null, // Will be filled when real data comes from backend
					proposalId: updates.newProposal.id,
					voter: updates.newProposal.proposer,
					voteType: 'Approval' as const,
					votingWeight,
					votedAt: new Date(),
				},
			], // Initialize with creator's approval vote
		};
		updatedData.proposals = [...oldData.proposals, proposalWithVotes];
	}

		// Update proposal status if provided
		if (updates.proposalId && updates.statusUpdate) {
			updatedData.proposals = updatedData.proposals.map((proposal) =>
				proposal.id === updates.proposalId
					? {
							...proposal,
							status: updates.statusUpdate as 'Active' | 'Passed' | 'Rejected',
					  }
					: proposal
			);
		}

		return updatedData;
	});
};

export const getCampaignsByUser = createServerFn({ method: 'GET' })
	.inputValidator(z.object({ address: z.string() }))
	.handler(async ({ data }) => {
		const res = await fetch(`${API_ENDPOINT}/users/${data.address}/campaigns`);

		if (!res.ok) {
			console.error('❌ API error:', res.status, res.statusText);
			throw new Error(
				`Failed to fetch user campaigns: ${res.status} ${res.statusText}`
			);
		}

		const response = (await res.json()) as {
			data: UserCampaign[];
			success: boolean;
			error: string | null;
		};

		if (!response.success) {
			throw new Error(response.error ?? 'Failed to fetch user campaigns');
		}

		console.log('✅ User campaigns fetched:', response.data.length);
		return response.data;
	});

export const userCampaignsQueryOptions = (address: string) => {
	return queryOptions({
		queryKey: ['user-campaigns', address],
		queryFn: () => getCampaignsByUser({ data: { address } }),
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
				amount: campaign.suiRaised,
				contributedAt: new Date(),
				txDigest: txHash,
			},
		],
		proposals: [],
	};
}
