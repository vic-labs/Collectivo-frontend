import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className='min-h-screen bg-primary/7'>
			<div className='container mx-auto px-4 py-8'>
				<header className='mb-8'>
					<h1 className='text-3xl font-bold'>Collectivo Dashboard</h1>
				</header>
				<main>
					<Outlet />
				</main>
			</div>
		</div>
	);
}
