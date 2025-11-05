// Shared types for frontend application

import { Campaign, Contribution, Withdrawal } from '@collectivo/shared-types';

// Campaign related types
declare global {
	type CampaignAndDetails = {
		campaign: Campaign;
		withdrawals: Withdrawal[];
		contributions: Contribution[];
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
		createdAt: Date;
		completedAt: Date | null;
		deletedAt: Date | null;
		walletAddress: string | null;
		contributions: Array<{
			id: number;
			campaignId: string;
			contributor: string;
			amount: string;
			contributedAt: Date;
			txDigest: string | null;
		}>;
		withdrawals: Array<{
			id: number;
			campaignId: string;
			contributor: string;
			amount: string;
			isFullWithdrawal: boolean;
			withdrawalAt: Date;
			txDigest: string | null;
		}>;
	};
}