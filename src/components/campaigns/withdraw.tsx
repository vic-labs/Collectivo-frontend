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
import { Campaign, Contribution, Withdrawal } from '@collectivo/shared-types';
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';
import { toast } from 'sonner';
import * as campaignModule from '@/contract-sdk/collectivo/campaign';
import { MIST_PER_SUI } from '@mysten/sui/utils';
import { useQueryClient } from '@tanstack/react-query';
import { updateCampaignQueryData } from '@/utils/campaigns';
import { BadgeAlert, BadgeCheck } from 'lucide-react';
import { EXPLORER_TX_URL } from '@/lib/constants';
import { useNetwork } from '@/lib/hooks/useNetwork';
import { formatSuiAmount } from '@/lib/app-utils';
import { ViewTxLink } from '../view-tx-link';

type WithdrawProps = {
	campaign: Campaign;
	contributions: Contribution[];
	withdrawals: Withdrawal[];
	userAddress?: string;
};

export function Withdraw({
	campaign,
	contributions,
	withdrawals,
	userAddress,
}: WithdrawProps) {
	const [amount, setAmount] = useState<number | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const network = useNetwork();
	const client = useSuiClient();
	const queryClient = useQueryClient();

	const { mutateAsync: signAndExecuteTransaction } =
		useSignAndExecuteTransaction();

	// Calculate user's available balance
	const userContributions = contributions
		.filter((c) => c.contributor === userAddress)
		.reduce((sum, c) => sum + c.amount, 0);

	const userWithdrawals = withdrawals
		.filter((w) => w.contributor === userAddress)
		.reduce((sum, w) => sum + w.amount, 0);

	const availableBalance = userContributions - userWithdrawals;

	async function handleWithdraw() {
		if (!amount || amount <= 0) {
			toast.error('Please enter a valid amount');
			return;
		}

		if (amount > availableBalance) {
			toast.error(`Cannot withdraw more than ${availableBalance} SUI`);
			return;
		}

		const tx = new Transaction();

		tx.add(
			campaignModule.withdraw({
				arguments: {
					campaign: campaign.id,
					amount: getMist(amount),
				},
			})
		);

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
					suiRaisedChange: -amount,
					newWithdrawal: {
						id: Date.now(),
						amount,
						campaignId: campaign.id,
						contributor: userAddress || '',
						txDigest: result.digest,
						withdrawnAt: new Date(),
						isFullWithdrawal: amount === availableBalance,
					},
				});

				return {
					amount,
					digest: result.digest,
				};
			},
			{
				loading: `Withdrawing ${amount} SUI...`,
				success: (data) => {
					// Close dialog on success (runs AFTER invalidation)
					setIsOpen(false);
					setAmount(null);

					return {
						message: `You just withdrew ${formatSuiAmount(data.amount)} SUI`,
						action: <ViewTxLink txHash={data.digest} />,
					};
				},
				error: (error) => {
					// Extract meaningful error message
					if (error instanceof Error) {
						return {
							message: error.message,
						};
					}
					return {
						message: 'Failed to withdraw. Please try again.',
					};
				},
			}
		);
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		handleWithdraw();
	};

	const handleMaxClick = () => {
		setAmount(availableBalance);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant='outline'
					className='w-full'
					size='lg'
					disabled={availableBalance <= 0 || !userAddress}>
					{!userAddress
						? 'Connect to Withdraw'
						: availableBalance <= 0
						? 'No Balance to Withdraw'
						: `Withdraw`}
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Withdraw from {campaign.nft.name}</DialogTitle>
					<DialogDescription>
						Available balance:{' '}
						<span className='font-bold text-foreground'>
							{availableBalance} SUI
						</span>
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className='grid gap-4'>
						<div className='grid gap-3'>
							<Label htmlFor='withdraw-amount'>Amount</Label>
							<div className='flex gap-2'>
								<Input
									id='withdraw-amount'
									name='amount'
									type='number'
									step='any'
									placeholder='Enter amount'
									value={amount ?? ''}
									onChange={(e) => setAmount(Number(e.target.value))}
									className='flex-1'
								/>
								<Button
									type='button'
									variant='secondary'
									onClick={handleMaxClick}
									className='shrink-0'>
									Max
								</Button>
							</div>
							<p className='text-xs text-muted-foreground'>
								Maximum: {availableBalance} SUI
							</p>
						</div>
					</div>
					<DialogFooter className='mt-4'>
						<DialogClose asChild>
							<Button type='button' variant='outline'>
								Cancel
							</Button>
						</DialogClose>
						<Button type='submit' disabled={!amount || amount <= 0}>
							Withdraw
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
