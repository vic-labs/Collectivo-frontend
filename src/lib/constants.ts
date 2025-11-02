import { getFullnodeUrl } from '@mysten/sui/client';
import { SuiClient } from '@mysten/sui/client';

// Re-export all constants from shared-types
export {
    DEVNET_PACKAGE_ID,
    TESTNET_PACKAGE_ID,
    MAINNET_PACKAGE_ID,
    DEVNET_ADMIN_CAP,
    TESTNET_ADMIN_CAP,
    MAINNET_ADMIN_CAP,
    DEVNET_UPGRADE_CAP,
    TESTNET_UPGRADE_CAP,
} from '@collectivo/shared-types';

export const TRADEPORT_STORE_PACKAGE_ID = '0xbff3161b047fb8b727883838c09b08afa9e0dd0f5488bde9e99e80643da9b9e0';

export const suiMainnetClient = new SuiClient({
    url: getFullnodeUrl('mainnet'),
});

export const API_ENDPOINT = import.meta.env.DEV ? 'http://localhost:4444' : 'https://collectivo-api-proxy.nnadivictory316.workers.dev';

export const EXPLORER_TX_URL = ({ chain, txHash }: { chain: 'testnet' | 'mainnet' | 'devnet', txHash: string }) => `https://suiscan.xyz/${chain}/tx/${txHash}`;

export const EXPLORER_ADDRESS_URL = ({ chain, address }: { chain: 'testnet' | 'mainnet' | 'devnet', address: string }) => `https://suiscan.xyz/${chain}/account/${address}`;