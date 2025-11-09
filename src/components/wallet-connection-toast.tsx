import { useCurrentAccount } from '@mysten/dapp-kit';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const STORAGE_KEY = 'sui-dapp-kit:wallet-connection-info';
const descriptionClassName = 'text-gray-800! dark:text-gray-200!';

export function WalletConnectionToast() {
	const account = useCurrentAccount();
	const hasShownToastRef = useRef(false);

	useEffect(() => {
		if (hasShownToastRef.current) return;

		try {
			const storedConnection = localStorage.getItem(STORAGE_KEY);
			const storedData = storedConnection ? JSON.parse(storedConnection) : null;

			const wasPreviouslyConnected = storedData?.state?.lastConnectedAccountAddress;
			const isCurrentlyConnected = account?.address;

			// Only show toast on genuine first-time connections
			if (!wasPreviouslyConnected && isCurrentlyConnected && !hasShownToastRef.current) {
				toast.success('Wallet connected successfully', {
					description: `Connected to ${account.address.slice(0, 6)}...${account.address.slice(-4)}`,
					descriptionClassName,
				});
				hasShownToastRef.current = true;
			}
		} catch (error) {
			// Silently handle localStorage errors
			console.warn('Wallet connection toast: localStorage access failed', error);
		}
	}, [account?.address]);

	return null; // Invisible component
}