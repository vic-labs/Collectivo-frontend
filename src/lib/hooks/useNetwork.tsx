const isDev = import.meta.env.DEV;

export const useNetwork = () => {
	const network = isDev ? 'devnet' : 'mainnet';
	return network;
};
