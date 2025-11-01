/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as object from './deps/sui/object.js';
const $moduleName = '@local-pkg/collectivo::collectivo';
export const COLLECTIVO = new MoveStruct({ name: `${$moduleName}::COLLECTIVO`, fields: {
        dummy_field: bcs.bool()
    } });
export const AdminCap = new MoveStruct({ name: `${$moduleName}::AdminCap`, fields: {
        id: object.UID
    } });
export interface DepositFeeArguments {
    coin: RawTransactionArgument<string>;
}
export interface DepositFeeOptions {
    package?: string;
    arguments: DepositFeeArguments | [
        coin: RawTransactionArgument<string>
    ];
}
export function depositFee(options: DepositFeeOptions) {
    const packageAddress = options.package ?? '@local-pkg/collectivo';
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::coin::Coin<0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI>'
    ] satisfies string[];
    const parameterNames = ["coin"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'collectivo',
        function: 'deposit_fee',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}