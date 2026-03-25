import { useLiveQuery } from "@tanstack/react-db";
import { useForm } from "@tanstack/react-form";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";

import { todoSchema } from "#/db/schemas";
import { getTodoCount } from "#/funcs/todos";
import { demoTodoCollection } from "#/integrations/tanstack/db/-tmp.collections";

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
		<main className="page-wrap px-4 py-12">
			<section className="mx-auto max-w-2xl">
				<header className="mb-6 space-y-2">
					<h1 className="text-2xl font-bold text-(--sea-ink)">
						Synced Todos
					</h1>
					<p className="text-sm text-(--sea-ink-soft)">
						Create todos with TanStack Form, then toggle and delete them
						from the live Electric collection.
					</p>
				</header>

				<form
					noValidate
					className="mb-6 flex items-start gap-2"
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
								<div className="min-w-0 flex-1">
									<label htmlFor={field.name} className="sr-only">
										Todo text
									</label>
									<input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) =>
											field.handleChange(event.target.value)
										}
										placeholder="Add a todo..."
										aria-invalid={hasError}
										className="w-full min-w-0 rounded border border-(--line) px-3 py-2 text-sm transition outline-none focus:border-(--lagoon-deep)"
									/>
									{hasError ? (
										<p className="mt-2 text-sm text-red-600">
											{typeof firstError === "string"
												? firstError
												: firstError?.message}
										</p>
									) : null}
								</div>
							);
						}}
					</form.Field>

					<form.Subscribe
						selector={(state) => ({
							canSubmit: state.canSubmit,
							isSubmitting: state.isSubmitting,
						})}
					>
						{({ canSubmit, isSubmitting }) => (
							<button
								type="submit"
								disabled={!canSubmit || isSubmitting}
								className="rounded border border-(--line) px-4 py-2 text-sm font-medium text-(--lagoon-deep) transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{isSubmitting ? "Adding..." : "Add"}
							</button>
						)}
					</form.Subscribe>
				</form>

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

	return (
		<div className="space-y-2">
			{todoItems.length === 0 ? (
				<p className="text-sm text-(--sea-ink-soft)">No todos yet.</p>
			) : (
				todoItems.map((todo) => (
					<article
						key={todo.id}
						className="flex items-center gap-3 rounded border border-(--line) px-3 py-2"
					>
						<input
							type="checkbox"
							checked={todo.completed}
							onChange={() => {
								demoTodoCollection.update(todo.id, (draft) => {
									draft.completed = !draft.completed;
								});
							}}
						/>
						<span
							className={`flex-1 text-sm ${
								todo.completed
									? "text-(--sea-ink-soft) line-through"
									: "text-(--sea-ink)"
							}`}
						>
							{todo.text}
						</span>
						<button
							type="button"
							onClick={() => demoTodoCollection.delete(todo.id)}
							className="text-xs text-(--sea-ink-soft) transition hover:text-(--sea-ink)"
						>
							Delete
						</button>
					</article>
				))
			)}
		</div>
	);
}

function TodoListSkeleton({ count }: { count: number }) {
	if (count === 0) {
		return <p className="text-sm text-(--sea-ink-soft)">No todos yet.</p>;
	}

	return (
		<div className="space-y-2">
			{Array.from({ length: count }, (_, index) => (
				<div
					key={index}
					aria-hidden="true"
					className="flex items-center gap-3 rounded border border-(--line) px-3 py-2"
				>
					<div className="size-3 rounded-sm border border-(--line)" />
					<div className="h-5 flex-1 rounded bg-gray-100" />
					<div className="h-5 w-12 rounded bg-gray-100" />
				</div>
			))}
		</div>
	);
}
