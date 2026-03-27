import { useStore } from "@tanstack/react-form";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import {
	useFieldContext,
	useFormContext,
} from "#/integrations/tanstack/form/context";

function formatError(error: string | { message: string }): string {
	return typeof error === "string" ? error : error.message;
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
}: {
	label: string;
	placeholder?: string;
	type?: React.HTMLInputTypeAttribute;
	autoComplete?: string;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);
	const hasError = field.state.meta.isTouched && errors.length > 0;

	return (
		<div className="space-y-1.5">
			<Label htmlFor={field.name} className="text-xs font-medium">
				{label}
			</Label>
			<Input
				id={field.name}
				type={type}
				autoComplete={autoComplete}
				value={field.state.value}
				placeholder={placeholder}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				aria-invalid={hasError}
			/>
			{hasError && (
				<p className="text-xs text-destructive">{formatError(errors[0])}</p>
			)}
		</div>
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
		<div className="space-y-1.5">
			<Label htmlFor={field.name} className="text-xs font-medium">
				{label}
			</Label>
			<Textarea
				id={field.name}
				value={field.state.value}
				rows={rows}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				aria-invalid={hasError}
			/>
			{hasError && (
				<p className="text-xs text-destructive">{formatError(errors[0])}</p>
			)}
		</div>
	);
}

export function Select({
	label,
	values,
}: {
	label: string;
	values: Array<{ label: string; value: string }>;
	placeholder?: string;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);
	const hasError = field.state.meta.isTouched && errors.length > 0;

	return (
		<div className="space-y-1.5">
			<Label htmlFor={field.name} className="text-xs font-medium">
				{label}
			</Label>
			<select
				id={field.name}
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				aria-invalid={hasError}
				className="flex h-9 w-full rounded-md border border-input bg-input/20 px-3 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:bg-input/30"
			>
				{values.map((value) => (
					<option key={value.value} value={value.value}>
						{value.label}
					</option>
				))}
			</select>
			{hasError && (
				<p className="text-xs text-destructive">{formatError(errors[0])}</p>
			)}
		</div>
	);
}
