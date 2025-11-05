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
import {
	useSignAndExecuteTransaction,
	useSuiClient,
	useCurrentAccount,
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';
import { toast } from 'sonner';
import * as campaignModule from '@/contract-sdk/collectivo/campaign';
import { MIST_PER_SUI } from '@mysten/sui/utils';
import { useQueryClient } from '@tanstack/react-query';
import { updateCampaignQueryData } from '@/utils/campaigns';
import { Loader } from 'lucide-react';
import { formatSuiAmount, calculateDepositWithFee } from '@/lib/app-utils';
import { useAccountBalance } from '@/lib/hooks/useAccountBalance';
import { ViewTxLink } from '../view-tx-link';

type ContributeWithdrawProps = {
	mode: 'contribute' | 'withdraw';
	campaign: Campaign;
	contributions: Contribution[];
	withdrawals: Withdrawal[];
	userAddress?: string;
};

export function ContributeWithdraw({
	mode,
	campaign,
	contributions,
	withdrawals,
	userAddress,
}: ContributeWithdrawProps) {
	const [amount, setAmount] = useState<number | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const client = useSuiClient();
	const queryClient = useQueryClient();
	const account = useCurrentAccount();
	const { data: balance } = useAccountBalance();

	const { mutateAsync: signAndExecuteTransaction, isPending } =
		useSignAndExecuteTransaction();

	// Calculate values based on mode
	const remainingAmount = campaign.target - campaign.suiRaised;
	const userContributions = contributions
		.filter((c) => c.contributor === userAddress)
		.reduce((sum, c) => sum + c.amount, 0);

	const userWithdrawals = withdrawals
		.filter((w) => w.contributor === userAddress)
		.reduce((sum, w) => sum + w.amount, 0);

	const availableBalance = userContributions - userWithdrawals;

	// Mode-specific configurations
	const isContributeMode = mode === 'contribute';
	const isLoading = isPending;
	const buttonDisabled = isContributeMode 
		? !amount || amount < campaign.minContribution || isLoading
		: !amount || amount <= 0 || amount > availableBalance || isLoading;

	// Validation
	function validateTransaction() {
		if (isContributeMode) {
			if (balance && amount && amount > balance) {
				toast.error('You do not have enough SUI to contribute');
				return false;
			}
			if (!amount || amount < campaign.minContribution) {
				toast.error('Amount must be greater than minimum contribution');
				return false;
			}
			if (amount > remainingAmount) {
				toast.warning('You are contributing more than the remaining amount');
				return false;
			}
		} else {
			if (!amount || amount <= 0) {
				toast.error('Please enter a valid amount');
				return false;
			}
			if (amount > availableBalance) {
				toast.error(`Cannot withdraw more than ${availableBalance} SUI`);
				return false;
			}
		}
		return true;
	}

	// Build transaction
	function buildTransaction() {
		const tx = new Transaction();
		
		if (isContributeMode) {
			const [coin] = tx.splitCoins(tx.gas, [
				calculateDepositWithFee(getMist(amount!)),
			]);
			tx.add(
				campaignModule.contribute({
					arguments: {
						campaign: campaign.id,
						coin,
					},
				})
			);
		} else {
			tx.add(
				campaignModule.withdraw({
					arguments: {
						campaign: campaign.id,
						amount: getMist(amount!),
					},
				})
			);
		}
		
		return tx;
	}

	// Update query data
	function updateQueryData(result: { amount: number; digest: string }) {
		if (isContributeMode) {
			updateCampaignQueryData(queryClient, campaign.id, {
				suiRaisedChange: result.amount,
				newContribution: {
					id: Date.now(),
					amount: result.amount,
					campaignId: campaign.id,
					contributor: account?.address || '',
					txDigest: result.digest,
					contributedAt: new Date(),
				},
			});
			queryClient.invalidateQueries({
				queryKey: ['account-balance', account?.address],
			});
		} else {
			updateCampaignQueryData(queryClient, campaign.id, {
				suiRaisedChange: -result.amount,
				newWithdrawal: {
					id: Date.now(),
					amount: result.amount,
					campaignId: campaign.id,
					contributor: userAddress || '',
					txDigest: result.digest,
					withdrawnAt: new Date(),
					isFullWithdrawal: result.amount === availableBalance,
				},
			});
		}
	}

	// Unified transaction execution
	async function handleSubmit() {
		if (!amount || !validateTransaction()) return;

		const tx = buildTransaction();

		toast.promise(
			async () => {
				const result = await signAndExecuteTransaction({
					transaction: tx,
				});

				const finalResult = await client.waitForTransaction({
					digest: result.digest,
					options: {
						showEffects: true,
						showEvents: true,
					},
				});

				if (finalResult.effects?.status?.status !== 'success') {
					throw new Error(
						finalResult.effects?.status?.error || 'Transaction failed'
					);
				}

				updateQueryData({ amount, digest: result.digest });

				return {
					amount,
					digest: result.digest,
				};
			},
			{
				loading: `${isContributeMode ? 'Contributing' : 'Withdrawing'} ${formatSuiAmount(amount)} SUI...`,
				success: (data) => {
					setIsOpen(false);
					setAmount(null);

					return {
						message: `You just ${isContributeMode ? 'contributed' : 'withdrew'} ${formatSuiAmount(data.amount)} SUI`,
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
						message: `Failed to ${isContributeMode ? 'contribute' : 'withdraw'}. Please try again.`,
					};
				},
			}
		);
	}

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		handleSubmit();
	};

	const handleMaxClick = () => {
		setAmount(availableBalance);
	};

	// Button text and state
	const getButtonText = () => {
		if (isContributeMode) {
			return isLoading ? 'Contributing...' : 'Contribute';
		} else {
			if (!userAddress) return 'Connect to Withdraw';
			if (availableBalance <= 0) return 'No Balance to Withdraw';
			return isLoading ? 'Withdrawing...' : 'Withdraw';
		}
	};

	const getDialogTitle = () => {
		return isContributeMode 
			? `Contribute to ${campaign.nft.name}`
			: `Withdraw from ${campaign.nft.name}`;
	};

	const getDialogDescription = () => {
		if (isContributeMode) {
			return (
				<>
					Enter the amount you want to contribute below. (Minimum contribution
					is <span className='font-medium'>{campaign.minContribution}</span>{' '}
					SUI)
				</>
			);
		} else {
			return (
				<>
					Available balance:{' '}
					<span className='font-bold text-foreground'>
						{availableBalance} SUI
					</span>
				</>
			);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant={isContributeMode ? 'default' : 'outline'}
					className='w-full text-base'
					size={isContributeMode ? 'default' : 'lg'}
					disabled={!isContributeMode && (availableBalance <= 0 || !userAddress)}>
					{getButtonText()}
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>{getDialogTitle()}</DialogTitle>
					<DialogDescription>
						{getDialogDescription()}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleFormSubmit}>
					<div className='grid gap-1'>
						<Label htmlFor='amount'>Amount</Label>
						<div className={isContributeMode ? '' : 'flex gap-2'}>
							<Input
								id='amount'
								name='amount'
								type='number'
								step='any'
								placeholder={isContributeMode ? '' : 'Enter amount'}
								value={amount ?? ''}
								onChange={(e) => setAmount(e.target.value === '' ? null : Number(e.target.value))}
								className={isContributeMode ? '' : 'flex-1'}
							/>
							{!isContributeMode && (
								<Button
									type='button'
									variant='secondary'
									onClick={handleMaxClick}
									className='shrink-0'>
									Max
								</Button>
							)}
						</div>
						{isContributeMode ? (
							<p className='text-xs text-right text-muted-foreground'>
								Your balance{' '}
								<span className='font-bold'>
									{balance ? balance.toFixed(2) : '0.00'} SUI
								</span>
							</p>
						) : (
							<p className='text-xs text-muted-foreground'>
								Maximum: {availableBalance} SUI
							</p>
						)}
					</div>
					<DialogFooter className='mt-4'>
						<DialogClose asChild>
							<Button type='button' variant='outline'>
								Cancel
							</Button>
						</DialogClose>
						<Button
							type='submit'
							disabled={buttonDisabled}>
							{isLoading ? (
								<>
									<Loader className='size-4 animate-spin mr-2' />
									{isContributeMode ? 'Contributing...' : 'Withdrawing...'}
								</>
							) : (
								getButtonText()
							)}
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