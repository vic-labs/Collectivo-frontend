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
import { calculateDepositWithFee, formatSuiAmount } from '@/lib/app-utils';
import { useAccountBalance } from '@/lib/hooks/useAccountBalance';
import { updateCampaignQueryData } from '@/utils/campaigns';
import { Campaign } from '@collectivo/shared-types';
import {
	useCurrentAccount,
	useSignAndExecuteTransaction,
	useSuiClient,
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { MIST_PER_SUI } from '@mysten/sui/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { ViewTxLink } from '../view-tx-link';

export function Contribute({ campaign }: { campaign: Campaign }) {
	const [amount, setAmount] = useState<number | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const client = useSuiClient();
	const queryClient = useQueryClient();
	const account = useCurrentAccount();
	const { data: balance } = useAccountBalance();

	const { mutateAsync: signAndExecuteTransaction } =
		useSignAndExecuteTransaction();

	const remainingAmount = campaign.target - campaign.suiRaised;

	async function handleContribute() {
		if (balance && amount && amount > balance) {
			toast.error('You do not have enough SUI to contribute');
			return;
		}

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
				// Submit transaction
				const result = await signAndExecuteTransaction({
					transaction: tx,
				});

				// Wait for finality
				const finalResult = await client.waitForTransaction({
					digest: result.digest,
					options: {
						showEffects: true,
						showEvents: true,
					},
				});

				// Check if transaction succeeded
				if (finalResult.effects?.status?.status !== 'success') {
					throw new Error(
						finalResult.effects?.status?.error || 'Transaction failed'
					);
				}

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

				queryClient.invalidateQueries({
					queryKey: ['account-balance', account?.address],
				});

				return {
					amount,
					digest: result.digest,
				};
			},
			{
				loading: `Contributing ${formatSuiAmount(amount)} SUI...`,
				success: (data) => {
					// Close dialog on success (runs AFTER invalidation)
					setIsOpen(false);
					setAmount(null);

					return {
						message: `You just contributed ${formatSuiAmount(data.amount)} SUI`,
						action: <ViewTxLink txHash={data.digest} />,
					};
				},
				error: (error) => {
					if (error instanceof Error) {
						return {
							message: error.message,
						};
					}

					return {
						message: 'Failed to contribute. Please try again.',
					};
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
					<div className='grid gap-1'>
						<Label htmlFor='amount'>Amount</Label>
						<Input
							id='amount'
							name='amount'
							type='number'
							step='any'
							value={amount ?? ''}
							onChange={(e) => setAmount(e.target.value === '' ? null : Number(e.target.value))}
						/>
						<p className='text-xs text-right text-muted-foreground'>
							Your balance{' '}
							<span className='font-bold'>
								{balance ? balance.toFixed(2) : '0.00'} SUI
							</span>
						</p>
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
