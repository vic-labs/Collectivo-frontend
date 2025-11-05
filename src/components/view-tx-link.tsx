import { EXPLORER_TX_URL } from '@/lib/constants';
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
