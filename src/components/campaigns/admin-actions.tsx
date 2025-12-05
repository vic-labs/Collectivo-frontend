import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EllipsisIcon, Trash2 } from 'lucide-react';
import { useDeleteCampaign } from '@/lib/hooks/campaigns/useDeleteCampaign';
import { Campaign } from '@collectivo/shared-types';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type CampaignAdminActionsProps = {
	campaign: Campaign;
	userAddress?: string;
};

export const CampaignAdminActions = ({
	campaign,
	userAddress,
}: CampaignAdminActionsProps) => {
	const { deleteCampaign, isDeleting } = useDeleteCampaign({
		campaignId: campaign.id,
	});

	// Only show admin actions to the campaign creator
	if (!userAddress || userAddress !== campaign.creator) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				title='Actions'
				asChild
				className='absolute top-5 right-8'>
				<EllipsisIcon className='text-primary cursor-pointer' />
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>Manage campaign</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<DropdownMenuItem
							className='text-destructive focus:text-destructive cursor-pointer'
							onSelect={(e) => e.preventDefault()}>
							<Trash2 className='mr-2 h-4 w-4' />
							Delete Campaign
						</DropdownMenuItem>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete the
								campaign and all associated data. All contributors will be
								automatically refunded.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={deleteCampaign}
								disabled={isDeleting}
								className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
								{isDeleting ? 'Deleting...' : 'Delete Campaign'}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
