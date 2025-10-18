import { createNetworkConfig } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { MAINNET_ADMIN_CAP, MAINNET_PKG_ID, TESTNET_ADMIN_CAP, TESTNET_PKG_ID } from './constants';

const { networkConfig, useNetworkVariable } = createNetworkConfig({
    testnet: {
        url: getFullnodeUrl('testnet'),
        variables: {
            ADMIN_CAP: TESTNET_ADMIN_CAP,
            PKG_ID: TESTNET_PKG_ID,
        }
    },
    mainnet: {
        url: getFullnodeUrl('mainnet'),
        variables: {
            ADMIN_CAP: MAINNET_ADMIN_CAP,
            PKG_ID: MAINNET_PKG_ID,
        }
    },
});

export { networkConfig, useNetworkVariable };