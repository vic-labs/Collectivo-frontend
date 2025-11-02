import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as campaignModule from '@/contract-sdk/collectivo/campaign';
import { calculateDepositWithFee } from '@/lib/app-utils';
import { networkConfig, useNetworkVariable } from '@/lib/sui-network-config';
import { updateCampaignQueryData } from '@/utils/campaigns';
import { Campaign } from '@collectivo/shared-types';
import {
	useCurrentAccount,
	useSignAndExecuteTransaction,
	useSuiClient,
	useWallets,
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { MIST_PER_SUI } from '@mysten/sui/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNetwork } from '@/lib/hooks/useNetwork';
import { useNavigate } from '@tanstack/react-router';
import { EXPLORER_TX_URL } from '@/lib/constants';

export function Contribute({ campaign }: { campaign: Campaign }) {
	const [amount, setAmount] = useState<number | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const client = useSuiClient();
	const queryClient = useQueryClient();
	const account = useCurrentAccount();
	const network = useNetwork();
	// Change to mutateAsync for promise-based handling
	const { mutateAsync: signAndExecuteTransaction } =
		useSignAndExecuteTransaction();

	const remainingAmount = campaign.target - campaign.suiRaised;

	async function handleContribute() {
		if (!amount || amount < campaign.minContribution) {
			toast.error('Amount must be greater than the minimum contribution');
			return;
		}
		if (amount > remainingAmount) {
			toast.warning('You are contributing more than the remaining amount');
			return;
		}

		const tx = new Transaction();

		const [coin] = tx.splitCoins(tx.gas, [
			calculateDepositWithFee(getMist(amount)),
		]);

		tx.add(
			campaignModule.contribute({
				arguments: {
					campaign: campaign.id,
					coin,
				},
			})
		);

		// Wrap the entire flow in toast.promise
		toast.promise(
			async () => {
				// Step 1: Submit transaction
				const result = await signAndExecuteTransaction({
					transaction: tx,
				});

				// Step 2: Wait for finality
				const finalResult = await client.waitForTransaction({
					digest: result.digest,
					options: {
						showEffects: true,
						showEvents: true,
					},
				});

				// Step 3: Check if transaction succeeded
				if (finalResult.effects?.status?.status !== 'success') {
					throw new Error(
						finalResult.effects?.status?.error || 'Transaction failed'
					);
				}

				// Step 4: Update query data using reusable function
				updateCampaignQueryData(queryClient, campaign.id, {
					suiRaisedChange: amount,
					newContribution: {
						id: Date.now(), // Temporary ID until we get the real one from backend
						amount,
						campaignId: campaign.id,
						contributor: account?.address || '',
						txDigest: result.digest,
						contributedAt: new Date(),
					},
				});

				return {
					amount,
					digest: result.digest,
				};
			},
			{
				loading: `Contributing ${amount} SUI...`,
				success: (data) => {
					// Close dialog on success (runs AFTER invalidation)
					setIsOpen(false);
					setAmount(null);

					toast.success(`✅ Txn successful!`, {
						action: {
							label: 'View on explorer',
							onClick: () =>
								window.open(
									EXPLORER_TX_URL({ chain: network, txHash: data.digest }),
									'_blank'
								),
						},
						actionButtonStyle: {
							backgroundColor: 'var(--primary)',
							color: 'var(--primary-foreground)',
						},
					});
					return `Successfully contributed ${data.amount} SUI!`;
				},
				error: (error) => {
					// Extract meaningful error message
					if (error instanceof Error) {
						return error.message;
					}
					return 'Failed to contribute. Please try again.';
				},
			}
		);
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		handleContribute();
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button className='w-full text-base'>Contribute</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Contribute to {campaign.nft.name}</DialogTitle>
					<DialogDescription>
						Enter the amount you want to contribute below. (Minimum contribution
						is <span className='font-medium'>{campaign.minContribution}</span>{' '}
						SUI)
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className='grid gap-4'>
						<div className='grid gap-3'>
							<Label htmlFor='amount'>Amount</Label>
							<Input
								id='amount'
								name='amount'
								type='number'
								step='any'
								value={amount ?? ''}
								onChange={(e) => setAmount(Number(e.target.value))}
							/>
						</div>
					</div>
					<DialogFooter className='mt-4'>
						<DialogClose asChild>
							<Button type='button' variant='outline'>
								Cancel
							</Button>
						</DialogClose>
						<Button
							type='submit'
							disabled={!amount || amount < campaign.minContribution}>
							Contribute
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function getMist(amount: number) {
	const mistAmount = amount * Number(MIST_PER_SUI);
	return BigInt(Math.floor(mistAmount));
}
