import { useLiveQuery } from "@tanstack/react-db";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { Button } from "#/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "#/components/ui/empty";
import { Item, ItemContent, ItemGroup, ItemTitle } from "#/components/ui/item";
import { Separator } from "#/components/ui/separator";
import { Skeleton } from "#/components/ui/skeleton";
import { simpleListItemClientSchema } from "#/db/schemas/simple-list-items";
import { getSimpleListItemCount } from "#/funcs/simple-list-items";
import { demoSimpleListCollection } from "#/integrations/tanstack/db/-tmp.collections";
import { useAppForm } from "#/integrations/tanstack/form";

export const Route = createFileRoute("/_authed/demo/db/simple-list")({
	loader: async () => ({
		skeletonCount: await getSimpleListItemCount(),
	}),
	component: SimpleListDemoPage,
});

function SimpleListDemoPage() {
	const { skeletonCount } = Route.useLoaderData();
	const form = useAppForm({
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
					<form.AppField name="label">
						{(field) => (
							<field.TextField
								label="List item"
								placeholder="Add an item..."
								inline
							>
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
							</field.TextField>
						)}
					</form.AppField>
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
			<Empty className="animate-fade-in py-12">
				<EmptyHeader>
					<EmptyTitle>No items yet</EmptyTitle>
					<EmptyDescription>
						Add one above to get started.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<div className="animate-fade-in">
			<p className="mb-3 font-mono text-[10px] tracking-wider text-muted-foreground/60 uppercase">
				{listItems.length} {listItems.length === 1 ? "item" : "items"}
			</p>
			<ItemGroup>
				{listItems.map((item) => (
					<Item
						key={item.id}
						variant="outline"
						size="sm"
						className="border-border/50"
					>
						<ItemContent>
							<ItemTitle>{item.label}</ItemTitle>
						</ItemContent>
					</Item>
				))}
			</ItemGroup>
		</div>
	);
}

function SimpleListSkeleton({ count }: { count: number }) {
	if (count === 0) {
		return (
			<Empty className="py-12">
				<EmptyHeader>
					<EmptyTitle>No items yet</EmptyTitle>
					<EmptyDescription>
						Add one above to get started.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<div className="animate-pulse-subtle">
			<Skeleton className="mb-3 h-3 w-12" />
			<ItemGroup>
				{Array.from({ length: count }, (_, index) => (
					<Item
						key={index}
						variant="outline"
						size="sm"
						className="border-border/50"
						aria-hidden="true"
					>
						<ItemContent>
							<Skeleton className="h-5 w-full" />
						</ItemContent>
					</Item>
				))}
			</ItemGroup>
		</div>
	);
}
