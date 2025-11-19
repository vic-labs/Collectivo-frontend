import { Contribution, Vote } from '@collectivo/shared-types';

export type ProposalWithVotes = {
    votes?: Vote[];
    [key: string]: any;
};

export type VoteStats = {
    totalVotes: number;
    approvalVotes: Vote[];
    rejectionVotes: Vote[];
    approvalPower: number;
    rejectionPower: number;
    approvalPercentage: number;
    rejectionPercentage: number;
    userVote?: Vote;
};

/**
 * Calculate voting statistics for a proposal
 */
export function calculateVoteStats({
    proposal,
    contributions,
    currentUserAddress,
}: {
    proposal: ProposalWithVotes;
    contributions: Contribution[];
    currentUserAddress?: string;
}): VoteStats {
    const votes = proposal.votes || [];
    const totalVotes = votes.length;

    // Calculate total voting power
    const totalVotingPower = contributions.reduce((sum, c) => sum + c.amount, 0);

    // Helper to get voter's power
    const getVoterPower = (voterAddress: string) => {
        const contribution = contributions.find(
            (c) => c.contributor === voterAddress
        );
        return contribution ? contribution.amount : 0;
    };

    // Filter votes by type
    const approvalVotes = votes.filter((v) => v.voteType === 'Approval');
    const rejectionVotes = votes.filter((v) => v.voteType === 'Rejection');

    // Calculate voting power
    const approvalPower = approvalVotes.reduce(
        (sum, v) => sum + getVoterPower(v.voter),
        0
    );
    const rejectionPower = rejectionVotes.reduce(
        (sum, v) => sum + getVoterPower(v.voter),
        0
    );

    // Calculate percentages
    const approvalPercentage =
        totalVotingPower > 0 ? (approvalPower / totalVotingPower) * 100 : 0;
    const rejectionPercentage =
        totalVotingPower > 0 ? (rejectionPower / totalVotingPower) * 100 : 0;

    // Find user's vote
    const userVote = currentUserAddress
        ? votes.find(
            (v) => v.voter.toLowerCase() === currentUserAddress.toLowerCase()
        )
        : undefined;

    return {
        totalVotes,
        approvalVotes,
        rejectionVotes,
        approvalPower,
        rejectionPower,
        approvalPercentage,
        rejectionPercentage,
        userVote,
    };
}
