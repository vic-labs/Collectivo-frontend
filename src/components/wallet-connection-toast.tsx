import { formatAddress } from '@/lib/app-utils';
import { useCurrentAccount, useCurrentWallet } from '@mysten/dapp-kit';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const descriptionClassName = 'text-gray-800! dark:text-gray-200!';

type walletConnectState = {
	state: {
		lastConnectedWalletName: string | null;
		lastConnectedAccountAddress: string | null;
	};
	version: number;
};

export function WalletConnectionToast() {
	const { isDisconnected, isConnected } = useCurrentWallet();
	const currentAccount = useCurrentAccount();
	const [initialState, setInitialState] = useState<walletConnectState | null>(
		getWalletConnectionState()
	);

	const initialStateExists = useMemo(
		() => !!initialState?.state.lastConnectedAccountAddress,
		[initialState]
	);

	useEffect(() => {
		if (!initialStateExists && isConnected) {
			toast.success('Wallet connected successfully', {
				description: `Connected to ${formatAddress(
					currentAccount?.address ?? ''
				)}`,
				descriptionClassName,
			});
		}

		if (isDisconnected) {
			setInitialState(getWalletConnectionState());
		}
	}, [isConnected]);

	return null;
}

function getWalletConnectionState() {
	const key = 'sui-dapp-kit:wallet-connection-info';
	if (typeof window !== 'undefined') {
		const state = window.localStorage.getItem(key) as string;
		if (state) {
			return JSON.parse(state) as walletConnectState;
		}
	}
	return null;
}
