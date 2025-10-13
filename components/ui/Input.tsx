interface InputProps {
	id?: string;
	type?: string;
	value?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

export function Input({
	id,
	type = "text",
	value,
	onChange,
	placeholder,
	className = "",
	disabled = false
}: InputProps) {
	return (
		<input
			id={id}
			type={type}
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			disabled={disabled}
			className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
		/>
	);
}

interface LabelProps {
	htmlFor?: string;
	children: React.ReactNode;
	className?: string;
}

export function Label({ htmlFor, children, className = "" }: LabelProps) {
	return (
		<label 
			htmlFor={htmlFor} 
			className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
		>
			{children}
		</label>
	);
}
