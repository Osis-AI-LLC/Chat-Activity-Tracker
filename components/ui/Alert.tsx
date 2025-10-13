import { ReactNode } from "react";

interface AlertProps {
	children: ReactNode;
	variant?: "default" | "destructive" | "success";
	className?: string;
}

export function Alert({ children, variant = "default", className = "" }: AlertProps) {
	const variantClasses = {
		default: "border-border bg-background text-foreground",
		destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
		success: "border-green-500/50 text-green-700 dark:border-green-500 dark:text-green-400 [&>svg]:text-green-600"
	};

	return (
		<div className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${variantClasses[variant]} ${className}`}>
			{children}
		</div>
	);
}

interface AlertDescriptionProps {
	children: ReactNode;
	className?: string;
}

export function AlertDescription({ children, className = "" }: AlertDescriptionProps) {
	return (
		<div className={`text-sm [&_p]:leading-relaxed ${className}`}>
			{children}
		</div>
	);
}

interface AlertTitleProps {
	children: ReactNode;
	className?: string;
}

export function AlertTitle({ children, className = "" }: AlertTitleProps) {
	return (
		<h5 className={`mb-1 font-medium leading-none tracking-tight ${className}`}>
			{children}
		</h5>
	);
}
