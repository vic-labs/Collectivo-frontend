// Shared types for frontend application

import { Campaign, CampaignWithContributors, Contribution, DbNft, Proposal, Vote, Withdrawal } from '@collectivo/shared-types';

// Campaign related types
declare global {
	type ProposalWithVotes = Proposal & {
		votes: Vote[];
	};

	type CampaignAndDetails = {
		campaign: Campaign;
		withdrawals: Withdrawal[];
		contributions: Contribution[];
		proposals: ProposalWithVotes[];
		nftEvents?: NftEvent[];
	};

	type UserCampaign = CampaignWithContributors & {
		contributions: Contribution[];
		withdrawals: Withdrawal[];
		proposals: Proposal[];
	};
}