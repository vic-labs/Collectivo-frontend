import { useCurrentAccount } from '@mysten/dapp-kit';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { formatAddress } from '@/lib/app-utils';

const STORAGE_KEY = 'sui-dapp-kit:wallet-connection-info';
const descriptionClassName = 'text-gray-800! dark:text-gray-200!';

export function WalletConnectionToast() {
	const account = useCurrentAccount();
	const hasShownToastRef = useRef(false);

	useEffect(() => {
		// Early return if toast already shown or no account
		if (hasShownToastRef.current || !account?.address) return;

		try {
			const storedConnection = localStorage.getItem(STORAGE_KEY);
			const storedData = storedConnection ? JSON.parse(storedConnection) : null;

			const wasPreviouslyConnected =
				storedData?.state?.lastConnectedAccountAddress;

			// Only show toast on genuine first-time connections
			if (!wasPreviouslyConnected) {
				toast.success('Wallet connected successfully', {
					description: `Connected to ${formatAddress(account.address)}`,
					descriptionClassName,
				});
				hasShownToastRef.current = true;
			}
		} catch (error) {
			// Silently handle localStorage errors
			console.warn(
				'Wallet connection toast: localStorage access failed',
				error
			);
		}
	}, [account?.address]);

	return null;
}
