import { useLiveQuery } from "@tanstack/react-db";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "#/components/ui/empty";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "#/components/ui/item";
import { Separator } from "#/components/ui/separator";
import { Skeleton } from "#/components/ui/skeleton";
import { todoSchema } from "#/db/schemas/todos";
import { getTodoCount } from "#/funcs/todos";
import { demoTodoCollection } from "#/integrations/tanstack/db/-tmp.collections";
import { useAppForm } from "#/integrations/tanstack/form";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/_authed/demo/db/todos")({
	loader: async () => ({
		skeletonCount: await getTodoCount(),
	}),
	component: TodoDemoPage,
});

function TodoDemoPage() {
	const { user } = Route.useRouteContext();
	const { skeletonCount } = Route.useLoaderData();
	const form = useAppForm({
		defaultValues: {
			text: "",
		},
		validators: {
			onChange: todoSchema.add,
			onSubmit: todoSchema.add,
		},
		onSubmit: async ({ value, formApi }) => {
			const newTodo = todoSchema.add.parse(value);
			const transaction = demoTodoCollection.insert({
				text: newTodo.text,
				user_id: user.id,
			});

			await transaction.isPersisted.promise;
			formApi.reset();
		},
	});

	return (
		<main className="mx-auto w-full max-w-3xl px-5 py-12 sm:py-16">
			<section className="mx-auto w-full max-w-3xl">
				<header className="animate-fade-up mb-8">
					<p className="font-mono text-[11px] tracking-widest text-primary uppercase">
						Private collection
					</p>
					<h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
						Synced Todos
					</h1>
					<p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
						Create todos with TanStack Form, then toggle and delete them
						from the live Electric collection.
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
					<form.AppField name="text">
						{(field) => (
							<field.TextField
								label="Todo text"
								placeholder="What needs to be done?"
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

				<ClientOnly fallback={<TodoListSkeleton count={skeletonCount} />}>
					<TodoClientList skeletonCount={skeletonCount} />
				</ClientOnly>
			</section>
		</main>
	);
}

function TodoClientList({ skeletonCount }: { skeletonCount: number }) {
	const { data: todos, isLoading } = useLiveQuery(
		(query) =>
			query
				.from({ todo: demoTodoCollection })
				.orderBy(({ todo }) => todo.created_at, "desc"),
		[],
	);
	const todoItems = todos ?? [];

	if (isLoading) {
		return <TodoListSkeleton count={skeletonCount} />;
	}

	if (todoItems.length === 0) {
		return (
			<Empty className="animate-fade-in py-12">
				<EmptyHeader>
					<EmptyTitle>No todos yet</EmptyTitle>
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
				{todoItems.length} {todoItems.length === 1 ? "item" : "items"}
			</p>
			<ItemGroup>
				{todoItems.map((todo) => (
					<Item
						key={todo.id}
						variant="outline"
						size="sm"
						className="group border-border/50"
					>
						<ItemMedia variant="icon">
							<Checkbox
								checked={todo.completed}
								onCheckedChange={() => {
									demoTodoCollection.update(todo.id, (draft) => {
										draft.completed = !draft.completed;
									});
								}}
							/>
						</ItemMedia>
						<ItemContent>
							<ItemTitle
								className={cn(
									"transition-colors",
									todo.completed &&
										"text-muted-foreground line-through",
								)}
							>
								{todo.text}
							</ItemTitle>
						</ItemContent>
						<ItemActions>
							<Button
								variant="ghost"
								size="icon-xs"
								className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
								onClick={() => demoTodoCollection.delete(todo.id)}
							>
								<Trash2 className="size-3" />
							</Button>
						</ItemActions>
					</Item>
				))}
			</ItemGroup>
		</div>
	);
}

function TodoListSkeleton({ count }: { count: number }) {
	if (count === 0) {
		return (
			<Empty className="py-12">
				<EmptyHeader>
					<EmptyTitle>No todos yet</EmptyTitle>
					<EmptyDescription>
						Add one above to get started.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	const widths = ["w-11/12", "w-3/4", "w-5/6", "w-4/5", "w-9/10"] as const;

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
						<ItemMedia variant="icon">
							<Skeleton className="size-4.5 rounded-md" />
						</ItemMedia>
						<ItemContent>
							<Skeleton
								className={`h-5 ${widths[index % widths.length]}`}
							/>
						</ItemContent>
					</Item>
				))}
			</ItemGroup>
		</div>
	);
}
