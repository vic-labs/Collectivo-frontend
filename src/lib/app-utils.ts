

export function objectToQueryString(obj: Record<string, string | boolean | number | undefined | null>) {
    const params = Object.entries(obj)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');

    return params ? `?${params}` : '';
}