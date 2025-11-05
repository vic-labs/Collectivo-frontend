/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, MoveEnum, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as object from './deps/sui/object.js';
import * as balance from './deps/sui/balance.js';
import * as table from './deps/sui/table.js';
const $moduleName = '@local-pkg/collectivo::campaign';
export const ContributorInfo = new MoveStruct({ name: `${$moduleName}::ContributorInfo`, fields: {
        contributed_at: bcs.u64(),
        amount: bcs.u64()
    } });
export const NFT = new MoveStruct({ name: `${$moduleName}::NFT`, fields: {
        nft_id: bcs.Address,
        image_url: bcs.string(),
        rank: bcs.u64(),
        is_purchased: bcs.bool(),
        is_listed: bcs.bool(),
        nft_type: bcs.string(),
        name: bcs.string()
    } });
export const CampaignStatus = new MoveEnum({ name: `${$moduleName}::CampaignStatus`, fields: {
        Active: null,
        Completed: null
    } });
export const Campaign = new MoveStruct({ name: `${$moduleName}::Campaign`, fields: {
        id: object.UID,
        nft: NFT,
        description: bcs.string(),
        target: bcs.u64(),
        sui_raised: balance.Balance,
        min_contribution: bcs.u64(),
        user_contributions: table.Table,
        contributors: bcs.vector(bcs.Address),
        status: CampaignStatus,
        creator: bcs.Address,
        created_at: bcs.u64()
    } });
export const NewCampaignEvent = new MoveStruct({ name: `${$moduleName}::NewCampaignEvent`, fields: {
        campaign_id: bcs.Address
    } });
export const CampaignDeletedEvent = new MoveStruct({ name: `${$moduleName}::CampaignDeletedEvent`, fields: {
        campaign_id: bcs.Address
    } });
export const NewContributionEvent = new MoveStruct({ name: `${$moduleName}::NewContributionEvent`, fields: {
        campaign_id: bcs.Address,
        amount: bcs.u64(),
        contributor: bcs.Address,
        is_new: bcs.bool()
    } });
export const CampaignCompletedEvent = new MoveStruct({ name: `${$moduleName}::CampaignCompletedEvent`, fields: {
        campaign_id: bcs.Address
    } });
export const WithdrawEvent = new MoveStruct({ name: `${$moduleName}::WithdrawEvent`, fields: {
        campaign_id: bcs.Address,
        amount: bcs.u64(),
        is_full_withdrawal: bcs.bool(),
        contributor: bcs.Address
    } });
export const NFTPurchasedEvent = new MoveStruct({ name: `${$moduleName}::NFTPurchasedEvent`, fields: {
        campaign_id: bcs.Address
    } });
export const NFTListedEvent = new MoveStruct({ name: `${$moduleName}::NFTListedEvent`, fields: {
        campaign_id: bcs.Address
    } });
export const NFTDelistedEvent = new MoveStruct({ name: `${$moduleName}::NFTDelistedEvent`, fields: {
        campaign_id: bcs.Address
    } });
export const NFTActionError = new MoveEnum({ name: `${$moduleName}::NFTActionError`, fields: {
        Listing: null,
        Purchasing: null,
        Delisting: null
    } });
export const NFTActionErrorEvent = new MoveStruct({ name: `${$moduleName}::NFTActionErrorEvent`, fields: {
        campaign_id: bcs.Address,
        error_type: NFTActionError
    } });
export const WalletAddressSetEvent = new MoveStruct({ name: `${$moduleName}::WalletAddressSetEvent`, fields: {
        campaign_id: bcs.Address,
        wallet_address: bcs.Address
    } });
export const NFTStatus = new MoveEnum({ name: `${$moduleName}::NFTStatus`, fields: {
        Purchased: null,
        Listed: null,
        Delisted: null
    } });
export interface CreateArguments {
    nftId: RawTransactionArgument<string>;
    imageUrl: RawTransactionArgument<string>;
    rank: RawTransactionArgument<number | bigint>;
    name: RawTransactionArgument<string>;
    nftType: RawTransactionArgument<string>;
    description: RawTransactionArgument<string>;
    target: RawTransactionArgument<number | bigint>;
    minContribution: RawTransactionArgument<number | bigint>;
    contribution: RawTransactionArgument<string>;
}
export interface CreateOptions {
    package?: string;
    arguments: CreateArguments | [
        nftId: RawTransactionArgument<string>,
        imageUrl: RawTransactionArgument<string>,
        rank: RawTransactionArgument<number | bigint>,
        name: RawTransactionArgument<string>,
        nftType: RawTransactionArgument<string>,
        description: RawTransactionArgument<string>,
        target: RawTransactionArgument<number | bigint>,
        minContribution: RawTransactionArgument<number | bigint>,
        contribution: RawTransactionArgument<string>
    ];
}
export function create(options: CreateOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        'u64',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        'u64',
        'u64',
        '0x0000000000000000000000000000000000000000000000000000000000000002::coin::Coin<0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI>',
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ] satisfies string[];
    const parameterNames = ["nftId", "imageUrl", "rank", "name", "nftType", "description", "target", "minContribution", "contribution"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'create',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeleteArguments {
    campaign: RawTransactionArgument<string>;
}
export interface DeleteOptions {
    package?: string;
    arguments: DeleteArguments | [
        campaign: RawTransactionArgument<string>
    ];
}
export function _delete(options: DeleteOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::campaign::Campaign`
    ] satisfies string[];
    const parameterNames = ["campaign"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'delete',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ContributeArguments {
    campaign: RawTransactionArgument<string>;
    coin: RawTransactionArgument<string>;
}
export interface ContributeOptions {
    package?: string;
    arguments: ContributeArguments | [
        campaign: RawTransactionArgument<string>,
        coin: RawTransactionArgument<string>
    ];
}
export function contribute(options: ContributeOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::campaign::Campaign`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::coin::Coin<0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI>',
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ] satisfies string[];
    const parameterNames = ["campaign", "coin"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'contribute',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface WithdrawArguments {
    campaign: RawTransactionArgument<string>;
    amount: RawTransactionArgument<number | bigint>;
}
export interface WithdrawOptions {
    package?: string;
    arguments: WithdrawArguments | [
        campaign: RawTransactionArgument<string>,
        amount: RawTransactionArgument<number | bigint>
    ];
}
export function withdraw(options: WithdrawOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::campaign::Campaign`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["campaign", "amount"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'withdraw',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetNftStatusArguments {
    campaign: RawTransactionArgument<string>;
    status: RawTransactionArgument<string>;
    Cap: RawTransactionArgument<string>;
    nftId: RawTransactionArgument<string>;
    imageUrl: RawTransactionArgument<string>;
    rank: RawTransactionArgument<number | bigint>;
    name: RawTransactionArgument<string>;
    nftType: RawTransactionArgument<string>;
}
export interface SetNftStatusOptions {
    package?: string;
    arguments: SetNftStatusArguments | [
        campaign: RawTransactionArgument<string>,
        status: RawTransactionArgument<string>,
        Cap: RawTransactionArgument<string>,
        nftId: RawTransactionArgument<string>,
        imageUrl: RawTransactionArgument<string>,
        rank: RawTransactionArgument<number | bigint>,
        name: RawTransactionArgument<string>,
        nftType: RawTransactionArgument<string>
    ];
}
export function setNftStatus(options: SetNftStatusOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::campaign::Campaign`,
        `${packageAddress}::campaign::NFTStatus`,
        `${packageAddress}::collectivo::AdminCap`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        'u64',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ] satisfies string[];
    const parameterNames = ["campaign", "status", "Cap", "nftId", "imageUrl", "rank", "name", "nftType"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'set_nft_status',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetNftStatusErrorArguments {
    campaign: RawTransactionArgument<string>;
    errorType: RawTransactionArgument<string>;
    Cap: RawTransactionArgument<string>;
}
export interface SetNftStatusErrorOptions {
    package?: string;
    arguments: SetNftStatusErrorArguments | [
        campaign: RawTransactionArgument<string>,
        errorType: RawTransactionArgument<string>,
        Cap: RawTransactionArgument<string>
    ];
}
export function setNftStatusError(options: SetNftStatusErrorOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::campaign::Campaign`,
        `${packageAddress}::campaign::NFTActionError`,
        `${packageAddress}::collectivo::AdminCap`
    ] satisfies string[];
    const parameterNames = ["campaign", "errorType", "Cap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'set_nft_status_error',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CreateWalletArguments {
    campaign: RawTransactionArgument<string>;
    address: RawTransactionArgument<string>;
    Cap: RawTransactionArgument<string>;
}
export interface CreateWalletOptions {
    package?: string;
    arguments: CreateWalletArguments | [
        campaign: RawTransactionArgument<string>,
        address: RawTransactionArgument<string>,
        Cap: RawTransactionArgument<string>
    ];
}
export function createWallet(options: CreateWalletOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::campaign::Campaign`,
        'address',
        `${packageAddress}::collectivo::AdminCap`
    ] satisfies string[];
    const parameterNames = ["campaign", "address", "Cap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'create_wallet',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetWalletArguments {
    campaign: RawTransactionArgument<string>;
}
export interface GetWalletOptions {
    package?: string;
    arguments: GetWalletArguments | [
        campaign: RawTransactionArgument<string>
    ];
}
export function getWallet(options: GetWalletOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::campaign::Campaign`
    ] satisfies string[];
    const parameterNames = ["campaign"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'get_wallet',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetUserContributionArguments {
    self: RawTransactionArgument<string>;
    user: RawTransactionArgument<string>;
}
export interface GetUserContributionOptions {
    package?: string;
    arguments: GetUserContributionArguments | [
        self: RawTransactionArgument<string>,
        user: RawTransactionArgument<string>
    ];
}
export function getUserContribution(options: GetUserContributionOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::campaign::Campaign`,
        'address'
    ] satisfies string[];
    const parameterNames = ["self", "user"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'get_user_contribution',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ContributorAmountArguments {
    info: RawTransactionArgument<string>;
}
export interface ContributorAmountOptions {
    package?: string;
    arguments: ContributorAmountArguments | [
        info: RawTransactionArgument<string>
    ];
}
export function contributorAmount(options: ContributorAmountOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::campaign::ContributorInfo`
    ] satisfies string[];
    const parameterNames = ["info"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'contributor_amount',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SuiRaisedArguments {
    self: RawTransactionArgument<string>;
}
export interface SuiRaisedOptions {
    package?: string;
    arguments: SuiRaisedArguments | [
        self: RawTransactionArgument<string>
    ];
}
export function suiRaised(options: SuiRaisedOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::campaign::Campaign`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'sui_raised',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface TargetArguments {
    self: RawTransactionArgument<string>;
}
export interface TargetOptions {
    package?: string;
    arguments: TargetArguments | [
        self: RawTransactionArgument<string>
    ];
}
export function target(options: TargetOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::campaign::Campaign`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'target',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ContributorsCountArguments {
    self: RawTransactionArgument<string>;
}
export interface ContributorsCountOptions {
    package?: string;
    arguments: ContributorsCountArguments | [
        self: RawTransactionArgument<string>
    ];
}
export function contributorsCount(options: ContributorsCountOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::campaign::Campaign`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'contributors_count',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsContributorArguments {
    self: RawTransactionArgument<string>;
    user: RawTransactionArgument<string>;
}
export interface IsContributorOptions {
    package?: string;
    arguments: IsContributorArguments | [
        self: RawTransactionArgument<string>,
        user: RawTransactionArgument<string>
    ];
}
export function isContributor(options: IsContributorOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::campaign::Campaign`,
        'address'
    ] satisfies string[];
    const parameterNames = ["self", "user"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'is_contributor',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsCompletedArguments {
    self: RawTransactionArgument<string>;
}
export interface IsCompletedOptions {
    package?: string;
    arguments: IsCompletedArguments | [
        self: RawTransactionArgument<string>
    ];
}
export function isCompleted(options: IsCompletedOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::campaign::Campaign`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'is_completed',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface NftIsPurchasedArguments {
    self: RawTransactionArgument<string>;
}
export interface NftIsPurchasedOptions {
    package?: string;
    arguments: NftIsPurchasedArguments | [
        self: RawTransactionArgument<string>
    ];
}
export function nftIsPurchased(options: NftIsPurchasedOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::campaign::Campaign`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'nft_is_purchased',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface NftIsListedArguments {
    self: RawTransactionArgument<string>;
}
export interface NftIsListedOptions {
    package?: string;
    arguments: NftIsListedArguments | [
        self: RawTransactionArgument<string>
    ];
}
export function nftIsListed(options: NftIsListedOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::campaign::Campaign`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'nft_is_listed',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface NftIsDelistedArguments {
    self: RawTransactionArgument<string>;
}
export interface NftIsDelistedOptions {
    package?: string;
    arguments: NftIsDelistedArguments | [
        self: RawTransactionArgument<string>
    ];
}
export function nftIsDelisted(options: NftIsDelistedOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::campaign::Campaign`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'nft_is_delisted',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IdArguments {
    self: RawTransactionArgument<string>;
}
export interface IdOptions {
    package?: string;
    arguments: IdArguments | [
        self: RawTransactionArgument<string>
    ];
}
export function id(options: IdOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        `${packageAddress}::campaign::Campaign`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetNftStatusPurchasedOptions {
    package?: string;
    arguments?: [
    ];
}
export function getNftStatusPurchased(options: GetNftStatusPurchasedOptions = {}) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'get_nft_status_purchased',
    });
}
export interface GetNftStatusListedOptions {
    package?: string;
    arguments?: [
    ];
}
export function getNftStatusListed(options: GetNftStatusListedOptions = {}) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'get_nft_status_listed',
    });
}
export interface GetNftStatusDelistedOptions {
    package?: string;
    arguments?: [
    ];
}
export function getNftStatusDelisted(options: GetNftStatusDelistedOptions = {}) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'campaign',
        function: 'get_nft_status_delisted',
    });
}