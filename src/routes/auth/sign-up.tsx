import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import AuthCard from "#/components/AuthCard";
import { authClient } from "#/integrations/better-auth/client";
import { authSchema } from "#/integrations/better-auth/schemas";
import { useAppForm } from "#/integrations/tanstack/form";

const authSearchSchema = z.object({
	redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth/sign-up")({
	validateSearch: authSearchSchema,
	beforeLoad: async ({ context }) => {
		const { session } = context;

		if (session) {
			throw redirect({ to: "/demo/db/todos" });
		}
	},
	component: SignUpPage,
});

function SignUpPage() {
	const navigate = useNavigate();
	const search = Route.useSearch();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const form = useAppForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
		validators: {
			onChange: authSchema.signUp,
			onSubmit: authSchema.signUp,
		},
		onSubmit: async ({ value }) => {
			setErrorMessage(null);

			const { error } = await authClient.signUp.email({
				name: value.name,
				email: value.email,
				password: value.password,
			});

			if (error) {
				setErrorMessage(error.message || "Unable to create your account.");
				return;
			}

			if (search.redirect) {
				window.location.assign(search.redirect);
				return;
			}

			await navigate({ to: "/demo/db/todos" });
		},
	});

	return (
		<AuthCard
			title="Create account"
			description="Start with email/password auth and use the synced demo routes behind a real session."
			footerText="Already have an account?"
			footerHref="/auth/sign-in"
			footerLabel="Sign in"
		>
			<form
				noValidate
				className="space-y-4"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					void form.handleSubmit();
				}}
			>
				<form.AppField name="name">
					{(field) => <field.TextField label="Name" autoComplete="name" />}
				</form.AppField>

				<form.AppField name="email">
					{(field) => (
						<field.TextField
							label="Email"
							type="email"
							autoComplete="email"
						/>
					)}
				</form.AppField>

				<form.AppField name="password">
					{(field) => (
						<field.TextField
							label="Password"
							type="password"
							autoComplete="new-password"
						/>
					)}
				</form.AppField>

				{errorMessage ? (
					<p className="text-sm text-destructive">{errorMessage}</p>
				) : null}

				<form.AppForm>
					<form.SubscribeButton
						label="Create account"
						loadingLabel="Creating account..."
						className="w-full"
					/>
				</form.AppForm>
			</form>
		</AuthCard>
	);
}
