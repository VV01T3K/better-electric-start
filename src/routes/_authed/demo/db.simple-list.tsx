import { useForm } from '@tanstack/react-form'
import { useLiveQuery } from '@tanstack/react-db'
import { ClientOnly, createFileRoute } from '@tanstack/react-router'

import { simpleListItemClientSchema } from '#/db/schemas'
import { getSimpleListItemCount } from '#/funcs/simple-list-items'
import { demoSimpleListCollection } from './-db.simple-list.collection'

export const Route = createFileRoute('/_authed/demo/db/simple-list')({
  loader: async () => ({
    skeletonCount: await getSimpleListItemCount(),
  }),
  component: SimpleListDemoPage,
})

function SimpleListDemoPage() {
  const { skeletonCount } = Route.useLoaderData()
  const form = useForm({
    defaultValues: {
      label: '',
    },
    validators: {
      onChange: simpleListItemClientSchema.add,
      onSubmit: simpleListItemClientSchema.add,
    },
    onSubmit: async ({ value, formApi }) => {
      const transaction = demoSimpleListCollection.insert({
        label: value.label,
      })

      await transaction.isPersisted.promise
      formApi.reset()
    },
  })

  return (
    <main className="page-wrap px-4 py-12">
      <section className="mx-auto max-w-2xl">
        <header className="mb-6 space-y-2">
          <h1 className="text-2xl font-bold text-(--sea-ink)">Simple List</h1>
          <p className="text-sm text-(--sea-ink-soft)">
            Add items with TanStack Form and watch the synced list update live.
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
          <form.Field name="label">
            {(field) => {
              const errors = field.state.meta.errors
              const hasError = field.state.meta.isTouched && errors.length > 0
              const firstError = errors[0]

              return (
                <div className="min-w-0 flex-1">
                  <label htmlFor={field.name} className="sr-only">
                    List item
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Add an item..."
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

        <ClientOnly fallback={<SimpleListSkeleton count={skeletonCount} />}>
          <SimpleListClientList skeletonCount={skeletonCount} />
        </ClientOnly>
      </section>
    </main>
  )
}

function SimpleListClientList({ skeletonCount }: { skeletonCount: number }) {
  const { data: items, isLoading } = useLiveQuery(
    (query) =>
      query
        .from({ item: demoSimpleListCollection })
        .orderBy(({ item }) => item.created_at, 'desc'),
    [],
  )
  const listItems = items ?? []

  if (isLoading) {
    return <SimpleListSkeleton count={skeletonCount} />
  }

  return (
    <div className="space-y-2">
      {listItems.length === 0 ? (
        <p className="text-sm text-(--sea-ink-soft)">No items yet.</p>
      ) : (
        listItems.map((item) => (
          <article
            key={item.id}
            className="rounded border border-(--line) px-3 py-2 text-sm text-(--sea-ink)"
          >
            {item.label}
          </article>
        ))
      )}
    </div>
  )
}

function SimpleListSkeleton({ count }: { count: number }) {
  if (count === 0) {
    return <p className="text-sm text-(--sea-ink-soft)">No items yet.</p>
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="rounded border border-(--line) px-3 py-2"
        >
          <div className="h-5 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  )
}
