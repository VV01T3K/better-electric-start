import { useStore } from "@tanstack/react-form";

import { Button } from "#/components/ui/button";
import { Field, FieldError, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import {
	Select as SelectInput,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import {
	useFieldContext,
	useFormContext,
} from "#/integrations/tanstack/form/context";

function normalizeErrors(
	errors: Array<string | { message: string }>,
): Array<{ message?: string }> {
	return errors.map((error) =>
		typeof error === "string" ? { message: error } : error,
	);
}

export function SubscribeButton({
	label,
	loadingLabel,
	className,
}: {
	label: string;
	loadingLabel?: string;
	className?: string;
}) {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button type="submit" disabled={isSubmitting} className={className}>
					{isSubmitting && loadingLabel ? loadingLabel : label}
				</Button>
			)}
		</form.Subscribe>
	);
}

export function TextField({
	label,
	placeholder,
	type,
	autoComplete,
	inline,
	children,
}: {
	label: string;
	placeholder?: string;
	type?: React.HTMLInputTypeAttribute;
	autoComplete?: string;
	inline?: boolean;
	children?: React.ReactNode;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);
	const hasError = field.state.meta.isTouched && errors.length > 0;

	const input = (
		<Input
			id={field.name}
			name={field.name}
			type={type}
			autoComplete={autoComplete}
			value={field.state.value}
			placeholder={placeholder}
			onBlur={field.handleBlur}
			onChange={(e) => field.handleChange(e.target.value)}
			aria-invalid={hasError || undefined}
			className={inline ? "flex-1" : undefined}
		/>
	);

	return (
		<Field data-invalid={hasError || undefined}>
			<FieldLabel
				htmlFor={field.name}
				className={inline ? "sr-only" : undefined}
			>
				{label}
			</FieldLabel>
			{inline ? (
				<div className="flex items-center gap-2">
					{input}
					{children}
				</div>
			) : (
				input
			)}
			<FieldError errors={hasError ? normalizeErrors(errors) : undefined} />
		</Field>
	);
}

export function TextArea({
	label,
	rows = 3,
}: {
	label: string;
	rows?: number;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);
	const hasError = field.state.meta.isTouched && errors.length > 0;

	return (
		<Field data-invalid={hasError || undefined}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Textarea
				id={field.name}
				name={field.name}
				value={field.state.value}
				rows={rows}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				aria-invalid={hasError || undefined}
			/>
			<FieldError errors={hasError ? normalizeErrors(errors) : undefined} />
		</Field>
	);
}

export function Select({
	label,
	values,
	placeholder = "Select an option",
}: {
	label: string;
	values: Array<{ label: string; value: string }>;
	placeholder?: string;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);
	const hasError = field.state.meta.isTouched && errors.length > 0;

	return (
		<Field data-invalid={hasError || undefined}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<SelectInput
				id={field.name}
				name={field.name}
				modal={false}
				value={field.state.value}
				onValueChange={(value) => field.handleChange(value ?? "")}
			>
				<SelectTrigger
					aria-invalid={hasError || undefined}
					onBlur={field.handleBlur}
					className="w-full justify-between"
				>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent alignItemWithTrigger={false}>
					<SelectGroup>
						{values.map((value) => (
							<SelectItem key={value.value} value={value.value}>
								{value.label}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</SelectInput>
			<FieldError errors={hasError ? normalizeErrors(errors) : undefined} />
		</Field>
	);
}
