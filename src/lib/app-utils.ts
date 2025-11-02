import { SuiClient } from "@mysten/sui/client";
import { TRADEPORT_STORE_PACKAGE_ID, suiMainnetClient } from "./constants";
import { MIST_PER_SUI } from "@mysten/sui/utils";

/**
 * Calculate the deposit amount needed to get the intended contribution after 1% fee
 * Fee is 1% of contribution amount, so: deposit = contribution * 101 / 100
 * 
 * @param intendedContribution - The amount you want to contribute (in MIST)
 * @returns The deposit amount needed (in MIST) to get exactly intendedContribution after fee
 * 
 * @example
 * // To contribute 100000000 (0.1 SUI), deposit 101000000
 * const deposit = calculateDepositWithFee(100000000); // = 101000000
 */
export function calculateDepositWithFee(intendedContribution: bigint | number): bigint {
    const contribution = BigInt(intendedContribution);
    // deposit = contribution * 101 / 100
    return (contribution * 101n) / 100n;
}

export function objectToQueryString(obj: Record<string, string | boolean | number | undefined | null>) {
    const params = Object.entries(obj)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');

    return params ? `?${params}` : '';
}

export function formatAddress(address: string, userAddress?: string): string {
    const isYou = userAddress && address.toLowerCase() === userAddress.toLowerCase();
    const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return isYou ? `${truncated} (you)` : truncated;
}

export function formatSuiAmount(amount: number): string {
    // Round to 9 decimal places (SUI precision) to remove floating point errors
    const rounded = Math.round(amount * 1000000000) / 1000000000;
    // Format to remove trailing zeros while preserving up to 9 decimal places
    const formatted = rounded.toFixed(9);
    // Remove trailing zeros and optional decimal point
    return formatted.replace(/\.?0+$/, '');
}

export async function getTransferPolicyId({ nftType }: { nftType: string }): Promise<string | null> {
    try {
        const eventType = `0x2::transfer_policy::TransferPolicyCreated<${nftType}>`;
        const response = await suiMainnetClient.queryEvents({
            query: { MoveEventType: eventType },
            limit: 1,
        });

        if (response.data.length > 0) {
            const policyId = (response.data[0].parsedJson as any)?.id;
            return policyId || null;
        }

        return null;
    } catch (e) {
        return null;
    }
}


export async function getTradeportData({ nftId }: { nftId: string }) {
    try {
        const field = await suiMainnetClient.getDynamicFieldObject({
            parentId: TRADEPORT_STORE_PACKAGE_ID,
            name: { type: '0x2::object::ID', value: nftId },
        });
        const fields = (field.data?.content as any)?.fields;
        if (fields?.price && fields?.commission) {
            const tradeportPrice = parseInt(fields.price) / Number(MIST_PER_SUI);
            const commission = parseInt(fields.commission) / Number(MIST_PER_SUI);
            return tradeportPrice + commission;
        }
    } catch (error) {
        console.error(error);
    }
}