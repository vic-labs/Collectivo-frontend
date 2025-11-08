import { Link } from '@tanstack/react-router';

export const Cta = () => {
	return (
		<section className='py-8 px-2 lg:px-0 md:py-20 relative bg-white dark:bg-black/80 rounded-xl'>
			<div className='mx-auto w-full max-w-[95%]'>
				<h2 className='text-3xl md:text-4xl font-bold text-center mb-4'>
					Ready to Co-Own?
				</h2>
				<p className='lg:text-lg text-center max-w-lg mx-auto text-gray-600 dark:text-gray-300'>
					Now, anyone can fractionally own high-value NFTs through collective
					funding and transparent on-chain ownership on Sui.
				</p>
			</div>
			<div className='flex flex-col lg:flex-row gap-4 justify-center items-center mt-8'>
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
		</section>
	);
};
