import { Link } from '@tanstack/react-router';
import { Check } from 'lucide-react';

export const Hero = () => {
	return (
		<section className='py-8 md:py-24 bg-primary/5 relative overflow-x-hidden'>
			<div className='mx-auto w-full max-w-[95%]'>
				<div className='grid lg:grid-cols-2 gap-12 items-center'>
					<div className='space-y-8'>
						<div className='space-y-4'>
							<h1 className='text-4xl md:text-6xl font-extrabold tracking-tight'>
								Love that NFT but can't afford it?{' '}
								<span className='text-primary'>Split the cost.</span>
							</h1>
							<p className='text-lg text-gray-700 dark:text-gray-300 max-w-lg'>
								That grail NFT doesn't have to break the bank. Team up with
								others, split the cost, and co-own it together
							</p>
						</div>

						<div className='flex flex-col lg:flex-row gap-4'>
							<Link
								to='/campaigns'
								search={undefined as any}
								className='btn-primary-big'>
								Start Co-Owning
							</Link>
							<Link
								to='/campaigns'
								search={undefined as any}
								className='btn-secondary-big'>
								Browse Campaigns
							</Link>
						</div>

						<div className='space-y-4 pt-8'>
							<h3 className='font-semibold text-lg'>
								Bulletproof security with Sui Move smart contract
							</h3>
							<div className='space-y-2 text-muted-foreground'>
								<div className='flex items-center gap-2'>
									<div className='size-7 bg-primary rounded-full flex items-center justify-center p-1'>
										<Check className='text-white ' />
									</div>
									<span>
										{' '}
										<span className='font-medium lg:font-semibold'>
											Multi-sig protection
										</span>{' '}
										— Majority must agree
									</span>
								</div>
								<div className='flex items-center gap-2'>
									<div className='size-7 bg-primary rounded-full flex items-center justify-center p-1'>
										<Check className='text-white ' />
									</div>
									<span>
										<span className='font-medium lg:font-semibold'>
											Automatic execution
										</span>{' '}
										— Funds move only when conditions are met
									</span>
								</div>
								<div className='flex items-center gap-2'>
									<div className='size-7 bg-primary rounded-full flex items-center justify-center p-1'>
										<Check className='text-white' />
									</div>
									<span>
										<span className='font-medium lg:font-semibold'>
											Transparent ownership
										</span>{' '}
										— Every contribution, verified on-chain
									</span>
								</div>
							</div>
						</div>
					</div>

					<div className='absolute -right-[2%] w-[57%] mt-4'>
						<img
							src='/hero-right.svg'
							alt='Hero illustration showing NFT funding concept'
							className='hidden lg:block'
						/>
					</div>
				</div>
			</div>
		</section>
	);
};
