import { createNetworkConfig } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { DEVNET_ADMIN_CAP, DEVNET_PACKAGE_ID, MAINNET_ADMIN_CAP, MAINNET_PACKAGE_ID, TESTNET_ADMIN_CAP, TESTNET_PACKAGE_ID } from './constants';

const { networkConfig, useNetworkVariable } = createNetworkConfig({
    testnet: {
        url: getFullnodeUrl('testnet'),
        variables: {
            ADMIN_CAP: TESTNET_ADMIN_CAP,
            PKG_ID: TESTNET_PACKAGE_ID,
        }
    },

    mainnet: {
        url: getFullnodeUrl('mainnet'),
        variables: {
            ADMIN_CAP: MAINNET_ADMIN_CAP,
            PKG_ID: MAINNET_PACKAGE_ID,
        }
    },

    devnet: {
        url: getFullnodeUrl('devnet'),
        variables: {
            ADMIN_CAP: DEVNET_ADMIN_CAP,
            PKG_ID: DEVNET_PACKAGE_ID,
        }
    },
});

export { networkConfig, useNetworkVariable };