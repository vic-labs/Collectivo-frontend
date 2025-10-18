/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import * as object from './deps/sui/object.js';
const $moduleName = '@local-pkg/lets-own::collectivo';
export const COLLECTIVO = new MoveStruct({ name: `${$moduleName}::COLLECTIVO`, fields: {
        dummy_field: bcs.bool()
    } });
export const AdminCap = new MoveStruct({ name: `${$moduleName}::AdminCap`, fields: {
        id: object.UID
    } });