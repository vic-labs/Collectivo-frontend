import React, { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    useSignAndExecuteTransaction,
    useCurrentAccount,
    useSuiClient,
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import * as proposalModule from '@/contract-sdk/collectivo/proposal';
import { ViewTxLink } from '@/components/view-tx-link';

import { TOAST_DESCRIPTION_CLASSNAME } from '@/lib/constants';

const descriptionClassName = TOAST_DESCRIPTION_CLASSNAME;

export function useDeleteProposal({
    proposalId,
    campaignId,
}: {
    proposalId: string;
    campaignId: string;
}) {
    const [isDeleting, setIsDeleting] = useState(false);
    const queryClient = useQueryClient();
    const client = useSuiClient();
    const { mutateAsync: signAndExecuteTransaction } =
        useSignAndExecuteTransaction();
    const currentAccount = useCurrentAccount();

    const deleteProposal = useCallback(async () => {
        if (!currentAccount) {
            throw new Error('Please connect your wallet to delete this proposal');
        }

        // Build transaction
        const tx = new Transaction();

        tx.add(
            proposalModule._delete({
                arguments: {
                    proposal: proposalId,
                },
            })
        );

        // Execute transaction with simulation
        const testResults = await client.devInspectTransactionBlock({
            sender: currentAccount.address,
            transactionBlock: tx,
        });

        console.log(testResults);

        if (testResults.effects?.status?.status !== 'success') {
            throw new Error(
                testResults.effects?.status?.error || 'Failed to delete proposal'
            );
        }

        console.log('Test execution successful, sending transaction...');

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

        // Update query data
        queryClient.setQueryData(
            ['campaign', campaignId],
            (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    proposals: oldData.proposals.filter(
                        (p: any) => p.id !== proposalId
                    ),
                };
            }
        );

        return {
            digest: result.digest,
        };
    }, [
        proposalId,
        campaignId,
        client,
        currentAccount,
        signAndExecuteTransaction,
        queryClient,
    ]);

    const deleteProposalWithToast = useCallback(async () => {
        setIsDeleting(true);

        try {
            toast.promise(deleteProposal(), {
                loading: 'Deleting proposal...',
                success: (data) => ({
                    message: 'Proposal deleted successfully',
                    action: React.createElement(ViewTxLink, { txHash: data.digest }),
                }),
                error: (error: any) => {
                    if (error instanceof Error) {
                        return {
                            message: error.message,
                        };
                    }
                    return {
                        message: 'Failed to delete proposal',
                        description: 'If this error persists, please contact support',
                        descriptionClassName,
                    };
                },
            });
        } finally {
            setIsDeleting(false);
        }
    }, [deleteProposal]);

    return { deleteProposal: deleteProposalWithToast, isDeleting };
}
