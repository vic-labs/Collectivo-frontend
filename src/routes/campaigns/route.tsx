import { createFileRoute } from '@tanstack/react-router';
import { Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/campaigns')({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<section className='py-10 bg-primary/7 min-h-screen relative'>
			<div className='max-w-[95%] mx-auto px-4'>
				<Outlet />
			</div>
		</section>
	)
}
