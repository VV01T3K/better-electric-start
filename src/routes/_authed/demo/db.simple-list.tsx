import { useLiveQuery } from "@tanstack/react-db";
import { useForm } from "@tanstack/react-form";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Separator } from "#/components/ui/separator";
import { simpleListItemClientSchema } from "#/db/schemas/simple-list-items";
import { getSimpleListItemCount } from "#/funcs/simple-list-items";
import { demoSimpleListCollection } from "#/integrations/tanstack/db/-tmp.collections";

export const Route = createFileRoute("/_authed/demo/db/simple-list")({
	loader: async () => ({
		skeletonCount: await getSimpleListItemCount(),
	}),
	component: SimpleListDemoPage,
});

function SimpleListDemoPage() {
	const { skeletonCount } = Route.useLoaderData();
	const form = useForm({
		defaultValues: {
			label: "",
		},
		validators: {
			onChange: simpleListItemClientSchema.add,
			onSubmit: simpleListItemClientSchema.add,
		},
		onSubmit: async ({ value, formApi }) => {
			const transaction = demoSimpleListCollection.insert({
				label: value.label,
			});

			await transaction.isPersisted.promise;
			formApi.reset();
		},
	});

	return (
		<main className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
			<section className="mx-auto max-w-xl">
				<header className="animate-fade-up mb-8">
					<p className="font-mono text-[11px] tracking-widest text-primary uppercase">
						Shared collection
					</p>
					<h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
						Simple List
					</h1>
					<p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
						Add items with TanStack Form and watch the synced list update
						live across all connected clients.
					</p>
				</header>

				<form
					noValidate
					className="animate-fade-up stagger-1 mb-8"
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<form.Field name="label">
						{(field) => {
							const errors = field.state.meta.errors;
							const hasError =
								field.state.meta.isTouched && errors.length > 0;
							const firstError = errors[0];

							return (
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<label htmlFor={field.name} className="sr-only">
											List item
										</label>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											placeholder="Add an item..."
											aria-invalid={hasError}
											className="flex-1"
										/>
										<form.Subscribe
											selector={(state) => ({
												canSubmit: state.canSubmit,
												isSubmitting: state.isSubmitting,
											})}
										>
											{({ canSubmit, isSubmitting }) => (
												<Button
													variant="default"
													size="default"
													type="submit"
													disabled={!canSubmit || isSubmitting}
												>
													<Plus className="size-3.5" />
													<span>
														{isSubmitting ? "Adding..." : "Add"}
													</span>
												</Button>
											)}
										</form.Subscribe>
									</div>
									{hasError ? (
										<p className="text-xs text-destructive">
											{typeof firstError === "string"
												? firstError
												: firstError?.message}
										</p>
									) : null}
								</div>
							);
						}}
					</form.Field>
				</form>

				<Separator className="mb-6" />

				<ClientOnly fallback={<SimpleListSkeleton count={skeletonCount} />}>
					<SimpleListClientList skeletonCount={skeletonCount} />
				</ClientOnly>
			</section>
		</main>
	);
}

function SimpleListClientList({ skeletonCount }: { skeletonCount: number }) {
	const { data: items, isLoading } = useLiveQuery(
		(query) =>
			query
				.from({ item: demoSimpleListCollection })
				.orderBy(({ item }) => item.created_at, "desc"),
		[],
	);
	const listItems = items ?? [];

	if (isLoading) {
		return <SimpleListSkeleton count={skeletonCount} />;
	}

	if (listItems.length === 0) {
		return (
			<div className="animate-fade-in flex flex-col items-center py-12 text-center">
				<p className="text-sm text-muted-foreground">No items yet.</p>
				<p className="mt-1 text-xs text-muted-foreground/60">
					Add one above to get started.
				</p>
			</div>
		);
	}

	return (
		<div className="animate-fade-in space-y-1.5">
			<p className="mb-3 font-mono text-[10px] tracking-wider text-muted-foreground/60 uppercase">
				{listItems.length} {listItems.length === 1 ? "item" : "items"}
			</p>
			{listItems.map((item) => (
				<div
					key={item.id}
					className="rounded-lg border border-border/50 bg-card/50 px-3.5 py-2.5 text-sm text-foreground transition-colors hover:bg-card"
				>
					{item.label}
				</div>
			))}
		</div>
	);
}

function SimpleListSkeleton({ count }: { count: number }) {
	if (count === 0) {
		return (
			<div className="flex flex-col items-center py-12 text-center">
				<p className="text-sm text-muted-foreground">No items yet.</p>
				<p className="mt-1 text-xs text-muted-foreground/60">
					Add one above to get started.
				</p>
			</div>
		);
	}

	return (
		<div className="animate-pulse-subtle space-y-1.5">
			<div className="mb-3 h-3 w-12 rounded bg-muted" />
			{Array.from({ length: count }, (_, index) => (
				<div
					key={index}
					aria-hidden="true"
					className="rounded-lg border border-border/50 bg-card/50 px-3.5 py-2.5"
				>
					<div className="h-5 rounded bg-muted" />
				</div>
			))}
		</div>
	);
}
