import { createFileRoute } from '@tanstack/react-router';
import { Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/campaigns/_layout')({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<section className='mt- py-10 bg-primary/7 min-h-screen w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]'>
			<div className='max-w-[95%] mx-auto px-4'>
				<Outlet />
			</div>
		</section>
	);
}
