import { useForm } from '@tanstack/react-form'
import { useLiveQuery } from '@tanstack/react-db'
import { createFileRoute } from '@tanstack/react-router'

import { todoCollection } from '#/db/collections'
import { todoSchema } from '#/db/schemas'

export const Route = createFileRoute('/demo/db/todos')({
  ssr: false,
  loader: () => {
    todoCollection.preload()
  },
  component: TodoDemoPage,
})

function TodoDemoPage() {
  const { data: todos, isLoading } = useLiveQuery(
    (query) =>
      query
        .from({ todo: todoCollection })
        .orderBy(({ todo }) => todo.created_at, 'desc'),
    [],
  )
  const todoItems = todos ?? []

  const form = useForm({
    defaultValues: {
      text: '',
    },
    validators: {
      onChange: todoSchema.add,
      onSubmit: todoSchema.add,
    },
    onSubmit: async ({ value, formApi }) => {
      const newTodo = todoSchema.add.parse(value)
      const transaction = todoCollection.insert({
        text: newTodo.text,
      })

      await transaction.isPersisted.promise
      formApi.reset()
    },
  })

  return (
    <main className="page-wrap px-4 py-12">
      <section className="mx-auto max-w-2xl">
        <header className="mb-6 space-y-2">
          <h1 className="text-2xl font-bold text-(--sea-ink)">Synced Todos</h1>
          <p className="text-sm text-(--sea-ink-soft)">
            Create todos with TanStack Form, then toggle and delete them from the
            live Electric collection.
          </p>
        </header>

        <form
          noValidate
          className="mb-6 flex items-start gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field name="text">
            {(field) => {
              const errors = field.state.meta.errors
              const hasError = field.state.meta.isTouched && errors.length > 0
              const firstError = errors[0]

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
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Add a todo..."
                    aria-invalid={hasError}
                    className="min-w-0 w-full rounded border border-(--line) px-3 py-2 text-sm outline-none transition focus:border-(--lagoon-deep)"
                  />
                  {hasError ? (
                    <p className="mt-2 text-sm text-red-600">
                      {typeof firstError === 'string'
                        ? firstError
                        : firstError?.message}
                    </p>
                  ) : null}
                </div>
              )
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
                {isSubmitting ? 'Adding...' : 'Add'}
              </button>
            )}
          </form.Subscribe>
        </form>

        <div className="space-y-2">
          {isLoading ? (
            <p className="text-sm text-(--sea-ink-soft)">Connecting...</p>
          ) : todoItems.length === 0 ? (
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
                    todoCollection.update(todo.id, (draft) => {
                      draft.completed = !draft.completed
                    })
                  }}
                />
                <span
                  className={`flex-1 text-sm ${todo.completed
                    ? 'text-(--sea-ink-soft) line-through'
                    : 'text-(--sea-ink)'
                    }`}
                >
                  {todo.text}
                </span>
                <button
                  type="button"
                  onClick={() => todoCollection.delete(todo.id)}
                  className="text-xs text-(--sea-ink-soft) transition hover:text-(--sea-ink)"
                >
                  Delete
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  )
}
