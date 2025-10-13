import { ReactNode } from "react";

interface CardProps {
	children: ReactNode;
	className?: string;
	variant?: "default" | "ghost" | "outline";
}

export function Card({ children, className = "", variant = "default" }: CardProps) {
	const variantClasses = {
		default: "bg-card text-card-foreground border border-border",
		ghost: "bg-transparent",
		outline: "bg-transparent border border-border"
	};

	return (
		<div className={`rounded-lg shadow-sm ${variantClasses[variant]} ${className}`}>
			{children}
		</div>
	);
}

interface CardHeaderProps {
	children: ReactNode;
	className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
	return (
		<div className={`p-6 pb-4 ${className}`}>
			{children}
		</div>
	);
}

interface CardContentProps {
	children: ReactNode;
	className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
	return (
		<div className={`p-6 pt-0 ${className}`}>
			{children}
		</div>
	);
}

interface CardTitleProps {
	children: ReactNode;
	className?: string;
}

export function CardTitle({ children, className = "" }: CardTitleProps) {
	return (
		<h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
			{children}
		</h3>
	);
}

interface CardDescriptionProps {
	children: ReactNode;
	className?: string;
}

export function CardDescription({ children, className = "" }: CardDescriptionProps) {
	return (
		<p className={`text-sm text-muted-foreground ${className}`}>
			{children}
		</p>
	);
}
