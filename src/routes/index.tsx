import { createFileRoute } from '@tanstack/react-router';
import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/How-it-works';
import { Cta } from '@/components/home/Cta';

export const Route = createFileRoute('/')({
	component: App,
});

function App() {
	return (
		<>
			<Hero />
			<HowItWorks />
			<Cta />
			<footer className='bg-primary/5 dark:bg-primary/10 lg:p-10 p-6 flex justify-between flex-col md:flex-row gap-1'>
				<div className='flex items-center gap-1 '>
					<img src='/logo.svg' alt='Logo' width={40} height={40} />
					<h2 className='lg:text-2xl text-xl font-extrabold font-sans text-primary'>
						Collectivo
					</h2>
				</div>
				<p className='text-gray-600 dark:text-gray-300 text-base'>
					© {new Date().getFullYear()} Collectivo. All rights reserved.
				</p>
			</footer>
		</>
	);
}
