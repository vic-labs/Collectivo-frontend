import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { WalletConnectionToast } from '@/components/wallet-connection-toast';

import '@fontsource/albert-sans/400.css';
import '@fontsource/albert-sans/500.css';
import '@fontsource/albert-sans/600.css';
import '@fontsource/albert-sans/700.css';
import '@fontsource/albert-sans/800.css';
import '@fontsource/albert-sans/900.css';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import '@mysten/dapp-kit/dist/index.css';
import { TanStackDevtools } from '@tanstack/react-devtools';
import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router';

import { Navbar } from '@/components/navbar';
import { networkConfig } from '@/lib/sui-network-config';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { SuiClient } from '@mysten/sui/client';
import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import appCss from '../styles.css?url';

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	head: () => ({
		meta: [
			{
				charSet: 'utf-8',
			},
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1',
			},
			{
				title: 'Collectivo',
			},
		],
		links: [
			{
				rel: 'stylesheet',
				href: appCss,
			},
		],
	}),

	component: RootComponent,
});
function RootComponent() {
	return (
		<SuiClientProvider
			defaultNetwork={import.meta.env.DEV ? 'devnet' : 'mainnet'}
			networks={networkConfig}
			createClient={(network, config) => {
				return new SuiClient({
					network,
					url: config.url,
					mvr: {
						overrides: {
							packages: {
								'@local-pkg/collectivo': config.variables.PKG_ID,
							},
						},
					},
				});
			}}>
			<WalletProvider autoConnect>
				<WalletConnectionToast />
				<ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
					<RootDocument>
						<NuqsAdapter>
							<Navbar />
							<Outlet />
							<Toaster />
						</NuqsAdapter>
					</RootDocument>
				</ThemeProvider>
			</WalletProvider>
		</SuiClientProvider>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en'>
			<head>
				<HeadContent />
				<script
					dangerouslySetInnerHTML={{
						__html: `
							(function() {
								try {
									const theme = localStorage.getItem('vite-ui-theme') || 'dark';
									const root = document.documentElement;
									
									root.classList.remove('light', 'dark');
									
									if (theme === 'system') {
										const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
										root.classList.add(systemTheme);
									} else {
										root.classList.add(theme);
									}
								} catch (e) {
									document.documentElement.classList.add('dark');
								}
							})();
						`,
					}}
				/>
			</head>
			<body>
				<main>{children}</main>
				{import.meta.env.DEV && (
					<TanStackDevtools
						config={{
							position: 'bottom-left',
						}}
						plugins={[
							{
								name: 'Tanstack Router',
								render: <TanStackRouterDevtoolsPanel />,
							},
						]}
					/>
				)}
				<ReactQueryDevtools initialIsOpen={false} />
				<Scripts />
			</body>
		</html>
	);
}
