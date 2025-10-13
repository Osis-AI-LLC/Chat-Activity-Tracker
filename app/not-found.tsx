export const dynamic = 'force-dynamic';

export default function NotFound() {
	return (
		<div className="flex justify-center items-center h-screen px-8">
			<div className="text-center">
				<h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
				<p className="text-xl text-gray-600">Page not found</p>
			</div>
		</div>
	);
}

