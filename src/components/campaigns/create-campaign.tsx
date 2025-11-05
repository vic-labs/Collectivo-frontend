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
import {
	calculateDepositWithFee,
	formatNumberToHumanReadable,
	mistToSui,
	suiToMist,
} from '@/lib/app-utils';
import { getNftDataQueryOptions } from '@/utils/nft';
import {
	useCurrentAccount,
	useSignAndExecuteTransaction,
	useSuiClient,
} from '@mysten/dapp-kit';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CustomConnectButton } from '../custom-connect-button';
import { RankBadge } from '../rank-badge';
import { useAccountBalance } from '@/lib/hooks/useAccountBalance';
import * as campaignModule from '@/contract-sdk/collectivo/campaign';
import { Transaction } from '@mysten/sui/transactions';
import { NewCampaign } from '@collectivo/shared-types';
import { useRouter } from '@tanstack/react-router';
import {
	createEmptyCampaignCache,
} from '@/utils/campaigns';

const descriptionClassName = 'text-gray-800! dark:text-gray-200!';

type CustomField = {
	description: string;
	minContribution: number | null;
	creatorContribution: number | null;
};

export function CreateCampaign({ isNavbar = false }: { isNavbar?: boolean }) {
	const [nftId, setNftId] = useState('');
	const account = useCurrentAccount();
	const suiClient = useSuiClient();
	const queryClient = useQueryClient();
	const { data: balance } = useAccountBalance();
	const router = useRouter();
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
		isSuccess: isSuccessNftData,
	} = useQuery(getNftDataQueryOptions(nftId));

	const {
		mutateAsync: signAndExecuteTransaction,
		isPending: isSigningTransaction,
	} = useSignAndExecuteTransaction();

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

	if (isErrorNftData) {
		toast.error('Failed to fetch NFT data', {
			description: 'NFT is probably not listed on the market',
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

		if (minContribution && creatorContribution) {
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
		}

		if (nftData && account) {
			const campaign: NewCampaign = {
				id: '', // Will be set after transaction
				creator: account.address,
				description,
				nft: nftData,
				target: nftData?.listingPrice ?? 0,
				suiRaised: creatorContribution,
				minContribution,
				status: 'Active',
				createdAt: new Date(),
			};

			const tx = new Transaction();

			const [creatorContributionCoin] = tx.splitCoins(tx.gas, [
				calculateDepositWithFee(suiToMist(creatorContribution)),
			]);

			tx.add(
				campaignModule.create({
					arguments: {
						name: nftData.name,
						nftId: nftData.id,
						imageUrl: nftData.imageUrl,
						rank: nftData.rank,
						nftType: nftData.type,
						description: description,
						target: nftData.listingPrice,
						minContribution: suiToMist(minContribution),
						contribution: creatorContributionCoin,
					},
				})
			);

			toast.promise(
				async () => {
					const testResults = await suiClient.devInspectTransactionBlock({
						sender: account.address,
						transactionBlock: tx,
					});

					if (testResults.effects?.status?.status !== 'success') {
						throw new Error(
							testResults.effects?.status?.error || 'Failed to create campaign'
						);
					}

					const result = await signAndExecuteTransaction({
						transaction: tx,
					});

					// Wait for transaction finality to get events
					const finalResult = await suiClient.waitForTransaction({
						digest: result.digest,
						options: {
							showEffects: true,
							showEvents: true,
						},
					});

					// Extract campaign ID from NewCampaignEvent
					const newCampaignEvent = finalResult.events?.find(
						(event) => event.type.includes('NewCampaignEvent')
					);

					const campaignId = (newCampaignEvent?.parsedJson as any)?.campaign_id as string;

					if (!campaignId) {
						throw new Error('Could not extract campaign ID from transaction events');
					}

					// Update cache with campaign ID
					const campaignWithId = { ...campaign, id: campaignId };
					queryClient.setQueryData(
						['campaign', campaignId],
						createEmptyCampaignCache({ campaign: campaignWithId, txHash: result.digest })
					);

					queryClient.invalidateQueries({
						queryKey: ['account-balance', account?.address],
					});

					return { digest: result.digest, campaignId };
				},
				{
					loading: 'Creating campaign...',
					success: (data) => {
						console.log('success', data);
						resetForm();

						router.navigate({
							to: '/campaigns/$campaignId',
							params: { campaignId: data.campaignId },
						});

						return {
							message: 'Campaign created successfully',
						};
					},
					error: (error) => {
						if (error instanceof Error) {
							return {
								message: error.message,
							};
						}

						return {
							message: 'Failed to create campaign',
							description: 'If this error persists, please contact support',
							descriptionClassName,
						};
					},
				}
			);
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button className='text-base'>
					<span className='lg:hidden'>
						{!isNavbar ? 'Create' : 'Create Campaign'}
					</span>{' '}
					<span className='hidden lg:block'>Create Campaign</span>{' '}
					<Plus color='white' />{' '}
				</Button>
			</DialogTrigger>
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
										className='size-35 rounded-lg border-primary border-2'
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
												minContribution: e.target.value === '' ? null : Number(e.target.value),
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
												creatorContribution: e.target.value === '' ? null : Number(e.target.value),
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
								<Button
									type='button'
									onClick={() => setStep('select-nft')}
									variant='outline'>
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
								<Button
									type='submit'
									// onClick={(e) => handleSubmit(e)}
									disabled={isSigningTransaction}>
									{isSigningTransaction ? (
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
