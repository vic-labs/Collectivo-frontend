import { suiNftApiResponse } from '@/lib/app-utils';
import { getNativeKioskListingPrice } from '@/lib/app-utils/nft';
import { SUI_NFT_API } from '@/lib/constants';
import { isValidSuiObjectId } from '@mysten/sui/utils';
import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

export const NFT_NOT_LISTED_ERROR = new Error(
	'NFT is not listed on the market'
);

export const getNftData = createServerFn({ method: 'GET' })
	.inputValidator(z.object({ id: z.string() }))
	.handler(async ({ data }) => {
		if (data.id && isValidSuiObjectId(data.id)) {
			const suiNftResponse = await fetch(`${SUI_NFT_API(data.id)}`);

			if (!suiNftResponse.ok) {
				if (suiNftResponse.status === 404) {
					throw NFT_NOT_LISTED_ERROR;
				}
				throw new Error('Failed to fetch NFT data');
			}

			const suiNftData = (await suiNftResponse.json()) as suiNftApiResponse;

			// Ensure rank is a number, parsing if it's a string with comma
			suiNftData.rank = parseFloat(String(suiNftData.rank).replace(',', '.'));

			const listingPrice = await getNativeKioskListingPrice({
				nftId: data.id,
				nftType: suiNftData.type,
			});

			if (!listingPrice) {
				throw NFT_NOT_LISTED_ERROR;
			}

			return {
				...suiNftData,
				listingPrice,
			};
		}
	});

export const getNftDataQueryOptions = (id: string) => {
	return queryOptions({
		queryKey: ['nfts', id],
		queryFn: () => getNftData({ data: { id } }),
		staleTime: 300_000, // 5 minutes
		refetchOnMount: false,
		enabled: !!id && isValidSuiObjectId(id),
		retry(failureCount, error) {
			if (
				error instanceof Error &&
				error.message.includes(NFT_NOT_LISTED_ERROR.message)
			) {
				return false;
			}
			return failureCount < 3;
		},
	});
};
