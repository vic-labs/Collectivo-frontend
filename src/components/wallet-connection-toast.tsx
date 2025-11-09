import { useCurrentAccount } from '@mysten/dapp-kit';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function WalletConnectionToast() {
	const account = useCurrentAccount();
	const previousAccountRef = useRef<string | null>(null);
	const isInitialMountRef = useRef(true);

	useEffect(() => {
		// Skip showing toast on initial mount to avoid auto-connect notifications
		if (isInitialMountRef.current) {
			isInitialMountRef.current = false;
			previousAccountRef.current = account?.address || null;
			return;
		}

		const previousAccount = previousAccountRef.current;
		const currentAccount = account?.address || null;

		// Show success toast when wallet connects (transitions from null to address)
		if (!previousAccount && currentAccount) {
			toast.success('Wallet connected successfully', {
				description: `Connected to ${account.address.slice(0, 6)}...${account.address.slice(-4)}`,
			});
		}

		previousAccountRef.current = currentAccount;
	}, [account?.address]);

	return null; // This component doesn't render anything
}