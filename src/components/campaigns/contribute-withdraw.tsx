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
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import { useAccountBalance } from '@/lib/hooks/useAccountBalance';
import { useContributeToCampaign } from '@/lib/hooks/campaigns/useContributeToCampaign';
import { useWithdrawFromCampaign } from '@/lib/hooks/campaigns/useWithdrawFromCampaign';

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
	const { data: balance } = useAccountBalance();

	const { contributeToCampaign, isContributing } = useContributeToCampaign(
		campaign.id
	);
	const { withdrawFromCampaign, isWithdrawing } = useWithdrawFromCampaign(
		campaign.id
	);

	// Calculate values based on mode
	const remainingAmount = (campaign.target - campaign.suiRaised) * 1.01;
	const userContributions = contributions
		.filter((c) => c.contributor === userAddress)
		.reduce((sum, c) => sum + c.amount, 0);

	const userWithdrawals = withdrawals
		.filter((w) => w.contributor === userAddress)
		.reduce((sum, w) => sum + w.amount, 0);

	const availableBalance = userContributions - userWithdrawals;

	// Mode-specific configurations
	const isContributeMode = mode === 'contribute';
	const isLoading = isContributeMode ? isContributing : isWithdrawing;
	const buttonDisabled = isContributeMode
		? !amount ||
		  (amount < campaign.minContribution &&
				availableBalance < campaign.minContribution) ||
		  isLoading
		: !amount ||
		  amount <= 0 ||
		  amount > availableBalance ||
		  (availableBalance - (amount || 0) > 0 &&
				availableBalance - (amount || 0) < campaign.minContribution) ||
		  isLoading;

	// Unified transaction execution
	async function handleSubmit() {
		if (!amount) return;

		// Validation
		if (isContributeMode) {
			if (balance && amount > balance) {
				toast.error('You do not have enough SUI to contribute');
				return;
			}
			// Allow contributions < minContribution if user already has sufficient balance
			if (
				amount < campaign.minContribution &&
				availableBalance < campaign.minContribution
			) {
				toast.error(
					`Amount must be at least ${campaign.minContribution} SUI for new contributors`
				);
				return;
			}
			if (amount > remainingAmount) {
				toast.warning('You are contributing more than the remaining amount');
				return;
			}

			await contributeToCampaign({
				amount,
				campaign,
				minContribution: campaign.minContribution,
				remainingAmount,
				balance,
				userBalance: availableBalance,
			});
		} else {
			if (amount <= 0) {
				toast.error('Please enter a valid amount');
				return;
			}
			if (amount > availableBalance) {
				toast.error(`Cannot withdraw more than ${availableBalance} SUI`);
				return;
			}
			// Prevent partial withdrawals that would leave insufficient balance
			const remainingBalance = availableBalance - amount;
			if (remainingBalance > 0 && remainingBalance < campaign.minContribution) {
				toast.error(
					`Cannot withdraw this amount. Remaining balance would be ${remainingBalance} SUI, which is below the minimum contribution of ${campaign.minContribution} SUI`
				);
				return;
			}

			await withdrawFromCampaign({
				amount,
				availableBalance,
			});
		}

		setIsOpen(false);
		setAmount(null);
	}

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		handleSubmit();
	};

  const handleMaxClick = () => {
		if (isContributeMode) {
			setAmount(remainingAmount);
		} else {
			setAmount(availableBalance);
		}
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
					disabled={
						!isContributeMode && (availableBalance <= 0 || !userAddress)
					}>
					{getButtonText()}
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>{getDialogTitle()}</DialogTitle>
					<DialogDescription>{getDialogDescription()}</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleFormSubmit}>
 					<div className='grid gap-1'>
						<Label htmlFor='amount'>Amount</Label>
						<div className='flex gap-2'>
							<Input
								id='amount'
								name='amount'
								type='number'
								step='any'
								placeholder={isContributeMode ? '' : 'Enter amount'}
								value={amount ?? ''}
								onChange={(e) =>
									setAmount(
										e.target.value === '' ? null : Number(e.target.value)
									)
								}
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
						<Button type='submit' disabled={buttonDisabled}>
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
