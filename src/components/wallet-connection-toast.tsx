import { useCurrentAccount } from '@mysten/dapp-kit';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { formatAddress } from '@/lib/app-utils';

const descriptionClassName = 'text-gray-800! dark:text-gray-200!';

export function WalletConnectionToast() {
	const account = useCurrentAccount();
	const previousAccountRef = useRef<string | null>(null);
	const hasInitializedRef = useRef(false);

	useEffect(() => {
		const currentAddress = account?.address || null;
		const previousAddress = previousAccountRef.current;

		// Skip the first effect run (initial mount) to avoid auto-connect toasts
		if (!hasInitializedRef.current) {
			hasInitializedRef.current = true;
			previousAccountRef.current = currentAddress;
			return;
		}

		// Show toast when transitioning from no account to having an account
		if (!previousAddress && currentAddress) {
			toast.success('Wallet connected successfully', {
				description: `Connected to ${formatAddress(currentAddress)}`,
				descriptionClassName,
			});
		}

		previousAccountRef.current = currentAddress;
	}, [account?.address]);

	return null;
}
