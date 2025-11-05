import { EXPLORER_TX_URL, EXPLORER_ADDRESS_URL } from '@/lib/constants';
import { useNetwork } from '@/lib/hooks/useNetwork';
import { ArrowUpRightIcon } from 'lucide-react';

export function ViewTxLink({ txHash }: { txHash: string }) {
	const network = useNetwork();

	return (
		<a
			className='text-primary underline'
			href={EXPLORER_TX_URL({ chain: network, txHash })}
			target='_blank'>
			View Tx <ArrowUpRightIcon className='size-4 inline-block' />
		</a>
	);
}

export function ViewAddressLink({ address, fullAddress }: { address: string; fullAddress?: string }) {
	const network = useNetwork();

	return (
		<a
			className='text-primary hover:underline'
			href={EXPLORER_ADDRESS_URL({ chain: network, address: fullAddress || address })}
			target='_blank'>
			{address}
		</a>
	);
}
