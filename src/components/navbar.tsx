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
import {
	Menu,
	Moon,
	Sun,
	Monitor,
	LogIn,
	LogOut,
	Wallet,
	ChevronDown,
} from 'lucide-react';
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
import { useAccountBalance } from '@/lib/hooks/useAccountBalance';

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

const WalletDropdown = () => {
	const currentAccount = useCurrentAccount();
	const { mutate: disconnectWallet } = useDisconnectWallet();
	const { data: balance } = useAccountBalance();

	if (!currentAccount) {
		return (
			<ConnectButton className='bg-primary! text-white! hover:bg-primary/90! transition-colors!' />
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button className='bg-primary! text-white! hover:bg-primary/90! transition-colors!'>
					<Wallet className='size-4 mr-2' />
					{currentAccount.address.slice(0, 6)}...
					{currentAccount.address.slice(-4)}
					<ChevronDown className='size-4 ml-2' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='w-56'>
				<DropdownMenuItem
					disabled
					className='flex items-center justify-between'>
					<p className='text-sm'>Balance:</p>
					<div className='flex items-center font-bold'>
						<img src='/sui.svg' alt='SUI' className='size-4' />
						<span>{balance ? balance.toFixed(2) : '0.00'} SUI</span>
					</div>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<CreateCampaign isNavbar={true} />
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => disconnectWallet()}>
					<LogOut className='size-4 mr-2' />
					Log Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

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
				<WalletDropdown />
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
			variant='outline'
			className='w-full justify-start'>
			{currentAccount ? (
				<>
					<LogOut className='size-4 mr-2' />
					Log Out
				</>
			) : (
				<>
					<LogIn className='size-4 mr-2' />
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
			<DropdownMenuContent className='space-y-2 font-medium w-[200px]'>
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
