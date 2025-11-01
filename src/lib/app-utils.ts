
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