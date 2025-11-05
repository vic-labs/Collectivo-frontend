// Shared types for frontend application

import { Campaign, Contribution, Proposal, Vote, Withdrawal } from '@collectivo/shared-types';

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
	};

	type UserCampaign = {
		id: string;
		creator: string;
		nft: any;
		description: string;
		target: string;
		suiRaised: string;
		minContribution: string;
		status: 'Active' | 'Completed';
		totalContributors: number;
		createdAt: Date;
		completedAt: Date | null;
		deletedAt: Date | null;
		walletAddress: string | null;
		contributions: Contribution[];
		withdrawals: Withdrawal[];
		proposals: Proposal[];
	};
}