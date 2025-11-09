import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatNumberToHumanReadable, mistToSui } from '@/lib/app-utils';
import { getNftDataQueryOptions } from '@/utils/nft';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CustomConnectButton } from '../custom-connect-button';
import { RankBadge } from '../rank-badge';
import { useAccountBalance } from '@/lib/hooks/useAccountBalance';
import { cn } from '@/lib/utils';
import { useCreateCampaign } from '@/lib/hooks/campaigns/useCreateCampaign';
import { NFT_NOT_LISTED_ERROR } from '@/utils/nft';

const descriptionClassName = 'text-gray-800! dark:text-gray-200!';

type CustomField = {
	description: string;
	minContribution: number | null;
	creatorContribution: number | null;
};

export function CreateCampaign({
	isNavbar = false,
	triggerOnly = false,
}: {
	isNavbar?: boolean;
	triggerOnly?: boolean;
}) {
	const [nftId, setNftId] = useState('');
	const account = useCurrentAccount();
	const { data: balance } = useAccountBalance();
	const [isOpen, setIsOpen] = useState(false);
	const [step, setStep] = useState<'select-nft' | 'create-campaign'>(
		'select-nft' as const
	);
	const [customFields, setCustomFields] = useState<CustomField>({
		description: '',
		minContribution: null,
		creatorContribution: null,
	});
	const {
		data: nftData,
		isLoading: isFetchingNftData,
		isError: isErrorNftData,
		error: errorNftData,
		isSuccess: isSuccessNftData,
	} = useQuery(getNftDataQueryOptions(nftId));

	const { createCampaign, isCreating } = useCreateCampaign();

	useEffect(() => {
		if (isSuccessNftData) {
			setStep('create-campaign');
		}
	}, [isSuccessNftData]);

	function resetForm() {
		setNftId('');
		setStep('select-nft');
		setCustomFields({
			description: '',
			minContribution: null,
			creatorContribution: null,
		});
		setIsOpen(false);
	}

	function back() {
		setStep('select-nft');
		setNftId('');
	}

	if (isErrorNftData) {
		toast.error('Failed to fetch NFT data', {
			description:
				errorNftData === NFT_NOT_LISTED_ERROR
					? 'NFT is probably not listed on the market or not indexed yet'
					: 'Please try again later',
			descriptionClassName,
		});
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const { description, minContribution, creatorContribution } = customFields;

		if (!description || !minContribution || !creatorContribution) {
			toast.error('Please fill all the required fields', {
				descriptionClassName,
			});
			return;
		}

		if (creatorContribution < minContribution) {
			toast.error(
				'Your contribution amount cannot be less than the minimum contribution',
				{
					descriptionClassName,
				}
			);
			return;
		}

		if (balance && creatorContribution > balance) {
			toast.error('You do not have enough SUI to contribute', {
				descriptionClassName,
			});
			return;
		}

		if (nftData) {
			await createCampaign({
				description,
				minContribution,
				creatorContribution,
				nftData,
			});
			resetForm();
		}
	}

	const triggerButton = (
		<Button
			className={cn(
				'text-base',
				isNavbar && 'w-full',
				triggerOnly && 'w-full justify-start'
			)}>
			<span className='lg:hidden'>
				{!isNavbar ? 'Create' : 'Create Campaign'}
			</span>{' '}
			<span className='hidden lg:block'>Create Campaign</span>{' '}
			<Plus color='white' />{' '}
		</Button>
	);

	if (triggerOnly) {
		return triggerButton;
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>{triggerButton}</DialogTrigger>
			<DialogContent
				className='sm:max-w-[450px]'
				onOpenAutoFocus={(e) => e.preventDefault()}>
				{account ? (
					<form onSubmit={handleSubmit} className='grid gap-4'>
						<DialogHeader>
							<DialogTitle>Create Campaign</DialogTitle>
							<DialogDescription>
								Create a new campaign to co-own an NFT.
							</DialogDescription>
						</DialogHeader>
						{step === 'select-nft' ? (
							<>
								<p className='text-sm text-muted-foreground font-bold py-3'>
									First, get NFT details by pasting the NFT ID below.
								</p>
								<div className='grid gap-4'>
									<div className='grid gap-1'>
										<Label htmlFor='nft-id'>Nft ID</Label>
										<Input
											id='nft-id'
											name='nftId'
											value={nftId}
											autoFocus={false}
											placeholder='Enter NFT Object ID'
											onChange={(e) => setNftId(e.target.value)}
										/>
									</div>
								</div>
							</>
						) : (
							<>
								<div className='text-sm flex text-muted-foreground items-start gap-2'>
									<img
										src={nftData?.imageUrl}
										alt={nftData?.name}
										className='size-35 rounded-lg shadow-md'
									/>
									<div className='grid gap-5 w-full pt-1'>
										<div className='flex items-center justify-between'>
											<p className='text-sm! font-medium '>Name:</p>
											<p className='text-sm! font-bold text-right'>
												{nftData?.name}
											</p>
										</div>

										<div className='flex items-center justify-between'>
											<p className='text-sm! font-medium'>Rank:</p>
											<RankBadge rank={nftData?.rank ?? 0} />
										</div>

										<div className='flex items-center justify-between'>
											<p className='text-sm! font-medium'>Target:</p>
											<p className='text-sm! flex items-center gap-1 font-bold'>
												<img src='/sui.svg' alt='sui' className='size-3' />
												{formatNumberToHumanReadable(
													mistToSui(nftData?.listingPrice ?? 0)
												)}{' '}
											</p>
										</div>
									</div>
								</div>

								<div className='grid gap-1'>
									<Label htmlFor='campaign-description'>
										Campaign Description
									</Label>
									<Input
										id='campaign-description'
										name='campaignDescription'
										value={customFields.description}
										required
										placeholder='This is a very rare NFT will be nice to have'
										onChange={(e) =>
											setCustomFields({
												...customFields,
												description: e.target.value,
											})
										}
									/>
								</div>

								<div className='grid gap-1'>
									<Label htmlFor='campaign-min-contribution'>
										Minimum Contribution
									</Label>
									<Input
										id='campaign-min-contribution'
										name='campaignMinContribution'
										value={customFields.minContribution ?? ''}
										required
										type='number'
										step='any'
										placeholder='Enter minimum contribution by co-owners'
										onChange={(e) =>
											setCustomFields({
												...customFields,
												minContribution:
													e.target.value === '' ? null : Number(e.target.value),
											})
										}
									/>
								</div>

								<div className='grid gap-1'>
									<Label htmlFor='campaign-min-contribution'>
										Your Contribution amount
									</Label>
									<Input
										disabled={!customFields.minContribution}
										id='campaign-min-contribution'
										name='campaignMinContribution'
										value={customFields.creatorContribution ?? ''}
										required
										type='number'
										step='any'
										placeholder='Enter your contribution amount'
										onChange={(e) =>
											setCustomFields({
												...customFields,
												creatorContribution:
													e.target.value === '' ? null : Number(e.target.value),
											})
										}
									/>
									<p className='text-xs text-right text-muted-foreground'>
										Your balance{' '}
										<span className='font-bold'>
											{balance ? balance.toFixed(2) : '0.00'} SUI
										</span>
									</p>
								</div>
							</>
						)}
						<DialogFooter
							className={step === 'select-nft' ? '' : 'justify-between!'}>
							{step === 'create-campaign' && (
								<Button type='button' onClick={back} variant='outline'>
									<ArrowLeft /> Back
								</Button>
							)}

							{step === 'select-nft' && (
								<Button type='button' disabled={!nftId || isFetchingNftData}>
									{isFetchingNftData ? (
										<>
											<Loader className='size-4 animate-spin' /> Getting Data...
										</>
									) : (
										'Next'
									)}
								</Button>
							)}
							{step === 'create-campaign' && (
								<Button type='submit' disabled={isCreating}>
									{isCreating ? (
										<>
											<Loader className='size-4 animate-spin' /> Creating
											Campaign...
										</>
									) : (
										'Save changes'
									)}
								</Button>
							)}
						</DialogFooter>
					</form>
				) : (
					<>
						<DialogHeader>
							<DialogTitle>
								Connect your wallet to create a campaign
							</DialogTitle>
						</DialogHeader>
						<CustomConnectButton />
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
