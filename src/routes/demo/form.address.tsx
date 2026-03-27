import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { Card, CardContent } from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";
import { useAppForm } from "#/integrations/tanstack/form";

export const Route = createFileRoute("/demo/form/address")({
	component: AddressForm,
});

const addressSchema = z.object({
	fullName: z.string().trim().min(1, "Full name is required."),
	email: z.email("Invalid email address."),
	address: z.object({
		street: z.string().trim().min(1, "Street address is required."),
		city: z.string().trim().min(1, "City is required."),
		state: z.string().trim().min(1, "State is required."),
		zipCode: z
			.string()
			.trim()
			.regex(/^\d{5}(-\d{4})?$/, "Invalid zip code format."),
		country: z.string().trim().min(1, "Country is required."),
	}),
	phone: z
		.string()
		.trim()
		.regex(
			/^(\+\d{1,3})?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
			"Invalid phone number format.",
		),
});

function AddressForm() {
	const form = useAppForm({
		defaultValues: {
			fullName: "",
			email: "",
			address: {
				street: "",
				city: "",
				state: "",
				zipCode: "",
				country: "",
			},
			phone: "",
		},
		validators: {
			onBlur: addressSchema,
			onSubmit: addressSchema,
		},
		onSubmit: ({ value }) => {
			console.log(value);
			alert("Form submitted successfully!");
		},
	});

	return (
		<main className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
			<div className="mx-auto max-w-lg">
				<header className="animate-fade-up mb-8">
					<p className="font-mono text-[11px] tracking-widest text-primary uppercase">
						Form demo
					</p>
					<h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
						Address Form
					</h1>
					<p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
						A multi-field form with nested validation powered by TanStack
						Form and Zod.
					</p>
				</header>

				<Card className="animate-fade-up stagger-1">
					<CardContent>
						<form
							noValidate
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								void form.handleSubmit();
							}}
							className="space-y-5"
						>
							<div className="space-y-4">
								<p className="font-mono text-[10px] tracking-wider text-muted-foreground/60 uppercase">
									Contact
								</p>
								<form.AppField name="fullName">
									{(field) => <field.TextField label="Full Name" />}
								</form.AppField>

								<form.AppField name="email">
									{(field) => (
										<field.TextField label="Email" type="email" />
									)}
								</form.AppField>

								<form.AppField name="phone">
									{(field) => (
										<field.TextField
											label="Phone"
											placeholder="123-456-7890"
										/>
									)}
								</form.AppField>
							</div>

							<Separator />

							<div className="space-y-4">
								<p className="font-mono text-[10px] tracking-wider text-muted-foreground/60 uppercase">
									Address
								</p>
								<form.AppField name="address.street">
									{(field) => (
										<field.TextField label="Street Address" />
									)}
								</form.AppField>

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
									<form.AppField name="address.city">
										{(field) => <field.TextField label="City" />}
									</form.AppField>
									<form.AppField name="address.state">
										{(field) => <field.TextField label="State" />}
									</form.AppField>
									<form.AppField name="address.zipCode">
										{(field) => <field.TextField label="Zip Code" />}
									</form.AppField>
								</div>

								<form.AppField name="address.country">
									{(field) => (
										<field.Select
											label="Country"
											values={[
												{ label: "United States", value: "US" },
												{ label: "Canada", value: "CA" },
												{ label: "United Kingdom", value: "UK" },
												{ label: "Australia", value: "AU" },
												{ label: "Germany", value: "DE" },
												{ label: "France", value: "FR" },
												{ label: "Japan", value: "JP" },
											]}
											placeholder="Select a country"
										/>
									)}
								</form.AppField>
							</div>

							<Separator />

							<div className="flex justify-end">
								<form.AppForm>
									<form.SubscribeButton label="Submit" />
								</form.AppForm>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
