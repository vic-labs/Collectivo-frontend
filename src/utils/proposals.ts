import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { toast } from 'sonner'
import * as proposal from '@/contract-sdk/collectivo/proposal'
import { updateCampaignQueryData } from '@/utils/campaigns'
import { Proposal } from '@collectivo/shared-types'

type CreateProposalParams = {
  campaignId: string
  type: 'List' | 'Delist'
  price?: string
}

type VoteParams = {
  proposalId: string
  campaignId: string
  voteType: 'Approval' | 'Rejection'
}

export const useCreateProposal = (campaignId: string, onSuccess?: () => void) => {
  const queryClient = useQueryClient()
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const currentAccount = useCurrentAccount()

  return useMutation({
    mutationFn: async ({ type, price }: Omit<CreateProposalParams, 'campaignId'>) => {
      if (!currentAccount) throw new Error('Wallet not connected')

      const tx = new Transaction()
      const campaignObj = tx.object(campaignId)

      let proposalTypeArg
      if (type === 'List') {
        if (!price) throw new Error('Price is required for List proposals')
        proposalTypeArg = proposal.newListProposalType({
          arguments: [parseInt(price) * 1_000_000], // Convert to MIST
        })
      } else {
        proposalTypeArg = proposal.newDelistProposalType()
      }

      tx.moveCall(
        proposal.create({
          arguments: [campaignObj, proposalTypeArg],
        }) as any
      )

      const result = await signAndExecuteTransaction({
        transaction: tx,
      })

      return { result, type, price }
    },
    onSuccess: ({ result, type, price }) => {
      toast.success('Proposal created successfully!')
      
      const newProposal: Proposal = {
        id: result.digest,
        campaignId: campaignId,
        proposer: currentAccount?.address || '',
        proposalType: type,
        listPrice: type === 'List' && price ? parseInt(price) * 1_000_000 : null,
        status: 'Active',
        createdAt: new Date(),
        endedAt: null,
        deletedAt: null,
      }

      updateCampaignQueryData(queryClient, campaignId, {
        newProposal,
      })

      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export const useVoteOnProposal = () => {
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const currentAccount = useCurrentAccount()

  return useMutation({
    mutationFn: async ({ proposalId, campaignId, voteType }: VoteParams) => {
      if (!currentAccount) throw new Error('Wallet not connected')

      const tx = new Transaction()
      const proposalObj = tx.object(proposalId)
      const campaignObj = tx.object(campaignId)

      let voteTypeArg
      if (voteType === 'Approval') {
        voteTypeArg = proposal.newApprovalVoteType()
      } else {
        voteTypeArg = proposal.newRejectionVoteType()
      }

      tx.moveCall(
        proposal.vote({
          arguments: [proposalObj, campaignObj, voteTypeArg],
        }) as any
      )

      const result = await signAndExecuteTransaction({
        transaction: tx,
      })

      return result
    },
    onSuccess: () => {
      toast.success('Vote cast successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
