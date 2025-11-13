import { SuiClient } from "@mysten/sui/client";
import { MIST_PER_SUI } from "@mysten/sui/utils";

export type SUI_NFT_API_RESPONSE = {
    id: string;
    name: string;
    imageUrl: string;
    listingPrice?: number;
    type: string;
    rank: number;
    attributes: {
        key: string;
        value: string;
    }[];
}

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
    const formatted = rounded.toFixed(2);
    // Remove trailing zeros and optional decimal point
    return formatted.replace(/\.?0+$/, '');
}


export async function getUserSuiBalance({ address, suiClient }: { address: string, suiClient: SuiClient }) {
    try {
        const balance = await suiClient.getBalance({
            owner: address,
            coinType: '0x2::sui::SUI',
        });
        return mistToSui(balance.totalBalance);
    } catch (error) {
        console.error(error);
        return 0;
    }
}

export function mistToSui(mist: bigint | string | number): number {
    return Number(mist) / Number(MIST_PER_SUI);
}

/**
 * Convert a decimal SUI amount (e.g., 0.206) to MIST as BigInt safely.
 * Avoids floating-point precision issues by scaling.
 *
 * @param suiAmount SUI amount as number (can be fractional)
 * @returns Amount in MIST as BigInt
 */
export function suiToMistSafeSafe(suiAmount: number): bigint {
    // Convert to string to avoid JS float precision errors
    const parts = suiAmount.toString().split(".");
    const whole = BigInt(parts[0] || "0");
    const fraction = parts[1] || "0";

    const scale = BigInt(10 ** fraction.length);
    const fractionValue = BigInt(fraction);

    // total MIST = whole * MIST_PER_SUI + (fraction / scale) * MIST_PER_SUI
    return whole * MIST_PER_SUI + (fractionValue * MIST_PER_SUI) / scale;
}

export function generateCampaignId(): string {
    return Math.random().toString(36).substring(2, 15);
}

export function formatNumberToHumanReadable(number?: number): string {
    if (!number) return '0';

    // Format with up to 2 decimal places
    const formatted = number.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

    // Strip unnecessary trailing zeros and decimal point
    return formatted.replace(/\.?0+$/, '');
}