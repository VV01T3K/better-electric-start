import { useLiveQuery } from "@tanstack/react-db";
import { useForm } from "@tanstack/react-form";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Checkbox } from "#/components/ui/checkbox";
import { Input } from "#/components/ui/input";
import { Separator } from "#/components/ui/separator";
import { todoSchema } from "#/db/schemas/todos";
import { getTodoCount } from "#/funcs/todos";
import { demoTodoCollection } from "#/integrations/tanstack/db/-tmp.collections";
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
	const form = useForm({
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
		<main className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
			<section className="mx-auto max-w-xl">
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
					<form.Field name="text">
						{(field) => {
							const errors = field.state.meta.errors;
							const hasError =
								field.state.meta.isTouched && errors.length > 0;
							const firstError = errors[0];

							return (
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<label htmlFor={field.name} className="sr-only">
											Todo text
										</label>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											placeholder="What needs to be done?"
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
			<div className="animate-fade-in flex flex-col items-center py-12 text-center">
				<p className="text-sm text-muted-foreground">No todos yet.</p>
				<p className="mt-1 text-xs text-muted-foreground/60">
					Add one above to get started.
				</p>
			</div>
		);
	}

	return (
		<div className="animate-fade-in space-y-2">
			<p className="mb-3 font-mono text-[10px] tracking-wider text-muted-foreground/60 uppercase">
				{todoItems.length} {todoItems.length === 1 ? "item" : "items"}
			</p>
			{todoItems.map((todo) => (
				<Card key={todo.id} size="sm" className="group border-border/50">
					<CardContent className="flex items-center gap-3">
						<Checkbox
							checked={todo.completed}
							onCheckedChange={() => {
								demoTodoCollection.update(todo.id, (draft) => {
									draft.completed = !draft.completed;
								});
							}}
						/>
						<span
							className={cn(
								"flex-1 text-sm transition-colors",
								todo.completed
									? "text-muted-foreground line-through"
									: "text-foreground",
							)}
						>
							{todo.text}
						</span>
						<Button
							variant="ghost"
							size="icon-xs"
							className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
							onClick={() => demoTodoCollection.delete(todo.id)}
						>
							<Trash2 className="size-3" />
						</Button>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function TodoListSkeleton({ count }: { count: number }) {
	if (count === 0) {
		return (
			<div className="flex flex-col items-center py-12 text-center">
				<p className="text-sm text-muted-foreground">No todos yet.</p>
				<p className="mt-1 text-xs text-muted-foreground/60">
					Add one above to get started.
				</p>
			</div>
		);
	}

	const widths = ["w-11/12", "w-3/4", "w-5/6", "w-4/5", "w-9/10"] as const;

	return (
		<div className="animate-pulse-subtle space-y-2">
			<div className="mb-3 h-3 w-12 rounded bg-muted" />
			{Array.from({ length: count }, (_, index) => (
				<div
					key={index}
					aria-hidden="true"
					className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-3 py-3 ring-1 ring-foreground/10"
				>
					<div className="size-4.5 rounded-md border border-input" />
					<div
						className={`h-5 rounded bg-muted ${widths[index % widths.length]}`}
					/>
				</div>
			))}
		</div>
	);
}
