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

export const Route = createFileRoute("/auth/sign-in")({
	validateSearch: authSearchSchema,
	beforeLoad: async ({ context }) => {
		const { session } = context;

		if (session) {
			throw redirect({ to: "/demo/db/todos" });
		}
	},
	component: SignInPage,
});

function SignInPage() {
	const navigate = useNavigate();
	const search = Route.useSearch();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const form = useAppForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onChange: authSchema.signIn,
			onSubmit: authSchema.signIn,
		},
		onSubmit: async ({ value }) => {
			setErrorMessage(null);

			const { error } = await authClient.signIn.email({
				email: value.email,
				password: value.password,
			});

			if (error) {
				setErrorMessage(error.message || "Unable to sign in.");
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
			title="Sign in"
			description="Access your private Electric-synced todos and the shared live list."
			footerText="Need an account?"
			footerHref="/auth/sign-up"
			footerLabel="Create one"
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
							autoComplete="current-password"
						/>
					)}
				</form.AppField>

				{errorMessage ? (
					<p className="text-sm text-destructive">{errorMessage}</p>
				) : null}

				<form.AppForm>
					<form.SubscribeButton
						label="Sign in"
						loadingLabel="Signing in..."
						className="w-full"
					/>
				</form.AppForm>
			</form>
		</AuthCard>
	);
}
