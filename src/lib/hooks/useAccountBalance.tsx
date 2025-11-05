import { useQuery } from '@tanstack/react-query';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { getUserSuiBalance } from '../app-utils';

export function useAccountBalance() {
	const client = useSuiClient();
	const account = useCurrentAccount();

	return useQuery({
		queryKey: ['account-balance', account?.address],
		queryFn: () =>
			getUserSuiBalance({ address: account?.address || '', suiClient: client }),
		enabled: !!account?.address,
		staleTime: 1000 * 60, // 1 minute
	});
}
