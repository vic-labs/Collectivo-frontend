/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, MoveEnum, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as vec_set from './deps/sui/vec_set.js';
import * as object from './deps/sui/object.js';
const $moduleName = '@local-pkg/collectivo::proposal';
export const VotersInfo = new MoveStruct({ name: `${$moduleName}::VotersInfo`, fields: {
        weight: bcs.u64(),
        voters: vec_set.VecSet(bcs.Address)
    } });
export const ProposalType = new MoveEnum({ name: `${$moduleName}::ProposalType`, fields: {
        List: new MoveStruct({ name: `ProposalType.List`, fields: {
                price: bcs.u64()
            } }),
        Delist: null
    } });
export const ProposalStatus = new MoveEnum({ name: `${$moduleName}::ProposalStatus`, fields: {
        Active: null,
        Passed: null,
        Rejected: null
    } });
export const Proposal = new MoveStruct({ name: `${$moduleName}::Proposal`, fields: {
        id: object.UID,
        campaign_id: bcs.Address,
        proposer: bcs.Address,
        proposal_type: ProposalType,
        approvals: VotersInfo,
        rejections: VotersInfo,
        status: ProposalStatus,
        created_at: bcs.u64(),
        ended_at: bcs.u64()
    } });
export const ProposalCreatedEvent = new MoveStruct({ name: `${$moduleName}::ProposalCreatedEvent`, fields: {
        proposal_id: bcs.Address
    } });
export const ProposalDeletedEvent = new MoveStruct({ name: `${$moduleName}::ProposalDeletedEvent`, fields: {
        proposal_id: bcs.Address
    } });
export const VoteType = new MoveEnum({ name: `${$moduleName}::VoteType`, fields: {
        Approval: null,
        Rejection: null
    } });
export const ProposalVotedEvent = new MoveStruct({ name: `${$moduleName}::ProposalVotedEvent`, fields: {
        proposal_id: bcs.Address,
        voter: bcs.Address,
        vote_type: VoteType
    } });
export const ProposalPassedEvent = new MoveStruct({ name: `${$moduleName}::ProposalPassedEvent`, fields: {
        proposal_id: bcs.Address
    } });
export const ProposalRejectedEvent = new MoveStruct({ name: `${$moduleName}::ProposalRejectedEvent`, fields: {
        proposal_id: bcs.Address
    } });
export interface CreateArguments {
    campaign: RawTransactionArgument<string>;
    proposalType: RawTransactionArgument<string>;
}
export interface CreateOptions {
    package?: string;
    arguments: CreateArguments | [
        campaign: RawTransactionArgument<string>,
        proposalType: RawTransactionArgument<string>
    ];
}
export function create(options: CreateOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::campaign::Campaign`,
        `${packageAddress}::proposal::ProposalType`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ] satisfies string[];
    const parameterNames = ["campaign", "proposalType"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'proposal',
        function: 'create',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeleteArguments {
    proposal: RawTransactionArgument<string>;
}
export interface DeleteOptions {
    package?: string;
    arguments: DeleteArguments | [
        proposal: RawTransactionArgument<string>
    ];
}
export function _delete(options: DeleteOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::proposal::Proposal`
    ] satisfies string[];
    const parameterNames = ["proposal"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'proposal',
        function: 'delete',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface VoteArguments {
    proposal: RawTransactionArgument<string>;
    campaign: RawTransactionArgument<string>;
    voteType: RawTransactionArgument<string>;
}
export interface VoteOptions {
    package?: string;
    arguments: VoteArguments | [
        proposal: RawTransactionArgument<string>,
        campaign: RawTransactionArgument<string>,
        voteType: RawTransactionArgument<string>
    ];
}
export function vote(options: VoteOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::proposal::Proposal`,
        `${packageAddress}::campaign::Campaign`,
        `${packageAddress}::proposal::VoteType`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ] satisfies string[];
    const parameterNames = ["proposal", "campaign", "voteType"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'proposal',
        function: 'vote',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsProposalPassedArguments {
    self: RawTransactionArgument<string>;
}
export interface IsProposalPassedOptions {
    package?: string;
    arguments: IsProposalPassedArguments | [
        self: RawTransactionArgument<string>
    ];
}
export function isProposalPassed(options: IsProposalPassedOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::proposal::Proposal`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'proposal',
        function: 'is_proposal_passed',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsProposalActiveArguments {
    self: RawTransactionArgument<string>;
}
export interface IsProposalActiveOptions {
    package?: string;
    arguments: IsProposalActiveArguments | [
        self: RawTransactionArgument<string>
    ];
}
export function isProposalActive(options: IsProposalActiveOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::proposal::Proposal`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'proposal',
        function: 'is_proposal_active',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsProposalRejectedArguments {
    self: RawTransactionArgument<string>;
}
export interface IsProposalRejectedOptions {
    package?: string;
    arguments: IsProposalRejectedArguments | [
        self: RawTransactionArgument<string>
    ];
}
export function isProposalRejected(options: IsProposalRejectedOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::proposal::Proposal`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'proposal',
        function: 'is_proposal_rejected',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ProposerArguments {
    self: RawTransactionArgument<string>;
}
export interface ProposerOptions {
    package?: string;
    arguments: ProposerArguments | [
        self: RawTransactionArgument<string>
    ];
}
export function proposer(options: ProposerOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::proposal::Proposal`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'proposal',
        function: 'proposer',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CampaignIdArguments {
    self: RawTransactionArgument<string>;
}
export interface CampaignIdOptions {
    package?: string;
    arguments: CampaignIdArguments | [
        self: RawTransactionArgument<string>
    ];
}
export function campaignId(options: CampaignIdOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::proposal::Proposal`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'proposal',
        function: 'campaign_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ApprovalsWeightArguments {
    self: RawTransactionArgument<string>;
}
export interface ApprovalsWeightOptions {
    package?: string;
    arguments: ApprovalsWeightArguments | [
        self: RawTransactionArgument<string>
    ];
}
export function approvalsWeight(options: ApprovalsWeightOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::proposal::Proposal`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'proposal',
        function: 'approvals_weight',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RejectionsWeightArguments {
    self: RawTransactionArgument<string>;
}
export interface RejectionsWeightOptions {
    package?: string;
    arguments: RejectionsWeightArguments | [
        self: RawTransactionArgument<string>
    ];
}
export function rejectionsWeight(options: RejectionsWeightOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::proposal::Proposal`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'proposal',
        function: 'rejections_weight',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface HasVoterVotedArguments {
    self: RawTransactionArgument<string>;
    voter: RawTransactionArgument<string>;
}
export interface HasVoterVotedOptions {
    package?: string;
    arguments: HasVoterVotedArguments | [
        self: RawTransactionArgument<string>,
        voter: RawTransactionArgument<string>
    ];
}
export function hasVoterVoted(options: HasVoterVotedOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::proposal::Proposal`,
        'address'
    ] satisfies string[];
    const parameterNames = ["self", "voter"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'proposal',
        function: 'has_voter_voted',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface StatusArguments {
    self: RawTransactionArgument<string>;
}
export interface StatusOptions {
    package?: string;
    arguments: StatusArguments | [
        self: RawTransactionArgument<string>
    ];
}
export function status(options: StatusOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::proposal::Proposal`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'proposal',
        function: 'status',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ProposalTypeArguments {
    self: RawTransactionArgument<string>;
}
export interface ProposalTypeOptions {
    package?: string;
    arguments: ProposalTypeArguments | [
        self: RawTransactionArgument<string>
    ];
}
export function proposalType(options: ProposalTypeOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::proposal::Proposal`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'proposal',
        function: 'proposal_type',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}