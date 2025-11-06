import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCreateProposal } from '@/lib/hooks/proposals/useCreateProposal';

const descriptionClassName = 'text-gray-800! dark:text-gray-200!';

type CreateProposalProps = {
	campaignId: string;
	onProposalCreated?: () => void;
	trigger?: React.ReactNode;
};

export function CreateProposal({
	campaignId,
	onProposalCreated,
	trigger,
}: CreateProposalProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [proposalType, setProposalType] = useState<'List' | 'Delist'>('List');
	const [listPrice, setListPrice] = useState<number | null>(null);

	const { createProposal, isCreating } = useCreateProposal(campaignId);

	async function handleCreateProposal() {
		// Validation
		if (proposalType === 'List' && (!listPrice || listPrice <= 0)) {
			toast.error('Please enter a valid list price', {
				descriptionClassName,
			});
			return;
		}

		try {
			await createProposal({ proposalType, listPrice: listPrice || undefined });
			setIsOpen(false);
			setListPrice(null);
			onProposalCreated?.();
		} catch (error) {
			// Error handled by hook
		}
	}

	const defaultTrigger = <Button size='sm'>New Proposal</Button>;

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>Create Proposal</DialogTitle>
					<DialogDescription>
						Propose to list or delist the NFT on the marketplace
					</DialogDescription>
				</DialogHeader>
				<div className='space-y-4 pt-4'>
					<div className='space-y-3'>
						<Label>Proposal Type</Label>
						<div className='grid grid-cols-2 gap-3'>
							<Button
								variant={proposalType === 'List' ? 'default' : 'outline'}
								onClick={() => setProposalType('List')}
								className='w-full'>
								List NFT
							</Button>
							<Button
								variant={proposalType === 'Delist' ? 'default' : 'outline'}
								onClick={() => setProposalType('Delist')}
								className='w-full'>
								Delist NFT
							</Button>
						</div>
					</div>
					{proposalType === 'List' && (
						<div className='space-y-2'>
							<Label htmlFor='price'>List Price (SUI)</Label>
							<Input
								id='price'
								type='number'
								step='any'
								min='0'
								placeholder='0.00'
								value={listPrice ?? ''}
								onChange={(e) =>
									setListPrice(
										e.target.value === '' ? null : Number(e.target.value)
									)
								}
							/>
						</div>
					)}
					<Button
						onClick={handleCreateProposal}
						disabled={isCreating}
						className='w-full'>
						{isCreating && <Loader className='animate-spin mr-2 h-4 w-4' />}
						Create Proposal
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
