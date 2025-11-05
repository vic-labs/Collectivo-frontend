import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from '@tanstack/react-router';
import { Menu, Moon, Sun, Monitor, LogIn, LogOut } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useState } from 'react';
import {
	ConnectButton,
	useCurrentAccount,
	useConnectWallet,
	useDisconnectWallet,
	useWallets,
} from '@mysten/dapp-kit';
import { CreateCampaign } from './campaigns/create-campaign';

const links = [
	{
		label: 'Home',
		href: '/',
	},
	// {
	// 	label: 'How it works',
	// 	href: '/#how-it-works',
	// },
	{
		label: 'Campaigns',
		href: '/campaigns',
	},
	{
		label: 'Dashboard',
		href: '/dashboard',
	},
];

export const Navbar = () => {
	return (
		<header className='max-w-[95%] mx-auto w-full flex items-center justify-between py-4'>
			<a href='/' className='flex items-center gap-2'>
				<img src={'/logo.svg'} alt='Logo' width={40} height={40} />
			</a>
			<nav className='flex font-bold md:font-medium text-sm md:text-base'>
				<ul className='flex gap-6 items-center'>
					{links.map((link) => (
						<li key={link.href}>
							<Link
								activeProps={{
									className: 'text-primary font-extrabold md:font-bold',
								}}
								to={link.href}>
								{link.label}
							</Link>
						</li>
					))}
				</ul>
			</nav>
			<div className='hidden md:flex items-center gap-4'>
				<ConnectButton className='bg-primary! text-white! hover:bg-primary/90! transition-colors!' />
				<ModeToggle />
			</div>

			<MobileNavbar />
		</header>
	);
};

const MobileConnectButton = () => {
	const currentAccount = useCurrentAccount();
	const { mutate: connectWallet } = useConnectWallet();
	const { mutate: disconnectWallet } = useDisconnectWallet();
	const wallets = useWallets();

	const handleConnect = () => {
		const firstWallet = wallets[0];
		if (firstWallet) {
			connectWallet({ wallet: firstWallet });
		}
	};

	const handleDisconnect = () => {
		disconnectWallet();
	};

	return (
		<Button
			onClick={currentAccount ? handleDisconnect : handleConnect}
			variant="outline"
			className="w-full justify-start"
		>
			{currentAccount ? (
				<>
					<LogOut className="size-4 mr-2" />
					Log Out
				</>
			) : (
				<>
					<LogIn className="size-4 mr-2" />
					Log In
				</>
			)}
		</Button>
	);
};

const MobileNavbar = () => {
	const { setTheme } = useTheme();
	const [isOpen, setIsOpen] = useState(false);
	const currentAccount = useCurrentAccount();

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger className='block md:hidden '>
				<Menu className='size-8 border-2 border-primary/20 rounded-md p-[2px]' />
			</DropdownMenuTrigger>
			<DropdownMenuContent className='space-y-2 font-medium'>
				{links.map((link) => (
					<DropdownMenuItem className='text-base border' key={link.href}>
						<Link
							onClick={() => setIsOpen(false)}
							activeProps={{ className: 'text-primary font-bold' }}
							to={link.href}>
							{link.label}
						</Link>
					</DropdownMenuItem>
				))}

				{currentAccount && <CreateCampaign isNavbar={true} />}

				<MobileConnectButton />

				<DropdownMenuSeparator />
				<DropdownMenuSub>
					<DropdownMenuSubTrigger className='text-base font-medium'>
						Switch Theme
					</DropdownMenuSubTrigger>
					<DropdownMenuPortal>
						<DropdownMenuSubContent>
							<DropdownMenuItem onClick={() => setTheme('light')}>
								<Sun className='mr-2 h-4 w-4' />
								Light
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTheme('dark')}>
								<Moon className='mr-2 h-4 w-4' />
								Dark
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTheme('system')}>
								<Monitor className='mr-2 h-4 w-4' />
								System
							</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuPortal>
				</DropdownMenuSub>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
