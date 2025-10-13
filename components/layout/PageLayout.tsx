import { ReactNode } from "react";

interface PageLayoutProps {
	children: ReactNode;
	title?: string;
	description?: string;
	className?: string;
}

export function PageLayout({ 
	children, 
	title, 
	description, 
	className = "" 
}: PageLayoutProps) {
	return (
		<div className={`min-h-screen bg-background ${className}`}>
			<div className="container mx-auto px-4 py-8 max-w-6xl">
				{(title || description) && (
					<div className="mb-8">
						{title && (
							<h1 className="text-3xl font-bold tracking-tight mb-2">
								{title}
							</h1>
						)}
						{description && (
							<p className="text-muted-foreground text-lg">
								{description}
							</p>
						)}
					</div>
				)}
				{children}
			</div>
		</div>
	);
}
