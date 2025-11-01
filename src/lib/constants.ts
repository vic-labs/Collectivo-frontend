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

// Frontend-specific constant
export const API_ENDPOINT = import.meta.env.DEV ? 'http://localhost:4444' : 'https://api.collectivo.com';
