import { useTheme } from '../theme-provider';

const steps = [
	{
		title: 'Create or Contribute to a Campaign',
		description:
			'Launch a campaign to buy an NFT or contribute to an existing campaign to be a co-owner.',
		image: '/create.svg',
		darkImage: '/create-dark-mode.svg',
	},
	{
		title: 'Get Co-owners',
		description:
			'Get co-owners to join your campaign and contribute to the NFT purchase. No middlemen. No barriers. Just a smarter way to own what you love but can’t afford',
		image: '/get.svg',
		darkImage: '/get-dark-mode.svg',
	},
	{
		title: 'NFT is Purchased',
		description:
			'Once the target is reached, the NFT is automatically purchased & held safely in a multisig wallet.',
		image: '/purchased.svg',
		darkImage: '/purchased-dark-mode.svg',
	},
	{
		title: 'Own Together',
		description:
			'Now you are a co-owner!. If eventually you all decide to sell, the funds are automatically disbursed to each co-owner based on their shares.',
		image: '/co-own.svg',
	},
];

export const HowItWorks = () => {
	const { resolvedTheme } = useTheme();

	return (
		<section
			className='py-8 mt-8 px-2 lg:px-0 md:py-20 relative bg-primary/5 dark:bg-primary/10 rounded-xl'
			id='how-it-works'>
			<div className='mx-auto w-full max-w-[95%]'>
				<h2 className='text-3xl md:text-4xl font-bold text-center mb-4'>
					How It Works
				</h2>
				<p className='lg:text-lg text-center max-w-lg mx-auto text-gray-600 dark:text-gray-300'>
					Launch a campaign to buy an NFT or contribute to an existing campaign
					to be a co-owner.
				</p>
			</div>

			<div className='lg:flex grid grid-cols-1 lg:flex-row lg:flex-wrap gap-8 lg:gap-6 place-items-center mt-14 lg:mt-24 justify-center items-center'>
				{steps.map((step, index) => (
					<div
						key={index}
						className='relative flex flex-col w-full space-y-4 pb-6 lg:space-y-0 lg:space-x-6 text-center rounded-xl bg-white dark:bg-black/40 lg:gap-9 max-w-lg lg:w-[calc(50%-0.375rem)] lg:!h-[480px] h-full'>
						<div className='absolute -top-2 -left-2 lg:-top-4 lg:-left-4 bg-primary text-white rounded-full w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-xl font-extrabold z-10'>
							{index + 1}
						</div>
						<div className='relative overflow-hidden flex-shrink-0'>
							<img
								src={
									resolvedTheme === 'dark'
										? step.darkImage
											? step.darkImage
											: step.image
										: step.image
								}
								alt={step.title}
								className='w-full h-auto object-cover'
							/>
							<div className='absolute -inset-x-7 blur-xl -bottom-12 lg:-bottom-8 h-30 bg-gradient-to-t from-white dark:from-gray-900/5 via-white dark:via-gray-900/50 to-transparent pointer-events-none z-2'></div>
						</div>
						<div className='flex flex-col space-y-2 flex-1 text-center px-5'>
							<h3 className='text-2xl font-extrabold font-sans lg:text-3xl'>
								{step.title}
							</h3>
							<p className='text-lg text-gray-700 dark:text-gray-300'>
								{step.description}
							</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
};
