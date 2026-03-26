import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
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
		<div className="flex min-h-screen items-center justify-center bg-muted p-4">
			<Card className="w-full max-w-2xl">
				<CardHeader>
					<CardTitle className="text-xl">Address Form</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						noValidate
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							void form.handleSubmit();
						}}
						className="space-y-6"
					>
						<form.AppField name="fullName">
							{(field) => <field.TextField label="Full Name" />}
						</form.AppField>

						<form.AppField name="email">
							{(field) => <field.TextField label="Email" />}
						</form.AppField>

						<form.AppField name="address.street">
							{(field) => <field.TextField label="Street Address" />}
						</form.AppField>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

						<form.AppField name="phone">
							{(field) => (
								<field.TextField
									label="Phone"
									placeholder="123-456-7890"
								/>
							)}
						</form.AppField>

						<div className="flex justify-end">
							<form.AppForm>
								<form.SubscribeButton label="Submit" />
							</form.AppForm>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
