import { useState } from 'react'
import type { FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from '@tanstack/react-db'

import { todoCollection } from '#/db/collections'

export const Route = createFileRoute('/demo/db/todos')({
  ssr: false,
  loader: async () => {
    await todoCollection.preload()
    return null
  },
  component: TodoDemoPage,
})

function TodoDemoPage() {
  const [draft, setDraft] = useState('')
  const { data: todos, isLoading } = useLiveQuery(
    (query) =>
      query
        .from({ todo: todoCollection })
        .orderBy(({ todo }) => todo.created_at, 'desc'),
    [],
  )
  const todoItems = todos ?? []

  const completedCount = todoItems.filter((todo) => todo.completed).length
  const remainingCount = todoItems.length - completedCount

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const text = draft.trim()
    if (!text) {
      return
    }

    todoCollection.insert({
      id: crypto.randomUUID(),
      text,
      completed: false,
      created_at: new Date(),
    })

    setDraft('')
  }

  return (
    <main className="page-wrap px-4 pb-10 pt-14">
      <section className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10">
        <p className="island-kicker mb-3">Electric SQL + TanStack DB</p>
        <h1 className="display-title max-w-3xl text-4xl leading-tight font-bold text-[var(--sea-ink)] sm:text-5xl">
          Synced todos with optimistic updates and live queries.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--sea-ink-soft)]">
          Add, toggle, and delete items locally. TanStack DB keeps the UI
          instant, and Electric streams the committed Postgres state back into
          the same collection.
        </p>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_320px]">
        <article className="island-shell rounded-[1.75rem] p-6">
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="todo-text">
              Todo text
            </label>
            <input
              id="todo-text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ship a synced todo demo"
              className="min-w-0 flex-1 rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3 text-[var(--sea-ink)] outline-none transition focus:border-[var(--lagoon-deep)] focus:bg-white"
            />
            <button
              type="submit"
              className="rounded-2xl border border-[rgba(50,143,151,0.35)] bg-[rgba(79,184,178,0.18)] px-5 py-3 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.28)]"
            >
              Add todo
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {isLoading ? (
              <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
                Connecting to the Electric shape stream...
              </p>
            ) : todoItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/35 px-5 py-8 text-center text-sm text-[var(--sea-ink-soft)]">
                No todos yet. Add one to see optimistic writes reconcile through
                Electric.
              </div>
            ) : (
              todoItems.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white/55 px-4 py-3"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => {
                      todoCollection.update(todo.id, (draftTodo) => {
                        draftTodo.completed = !draftTodo.completed
                      })
                    }}
                    className="h-5 w-5 rounded border-[var(--line)] text-[var(--lagoon-deep)]"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`m-0 text-sm font-medium ${
                        todo.completed
                          ? 'text-[var(--sea-ink-soft)] line-through'
                          : 'text-[var(--sea-ink)]'
                      }`}
                    >
                      {todo.text}
                    </p>
                    <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
                      Created {todo.created_at.toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => todoCollection.delete(todo.id)}
                    className="rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--sea-ink-soft)] transition hover:border-[rgba(23,58,64,0.3)] hover:text-[var(--sea-ink)]"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </article>

        <aside className="space-y-4">
          <article className="island-shell rounded-[1.75rem] p-5">
            <p className="island-kicker mb-3">Snapshot</p>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <StatCard label="Total" value={String(todoItems.length)} />
              <StatCard label="Completed" value={String(completedCount)} />
              <StatCard label="Remaining" value={String(remainingCount)} />
            </div>
          </article>

          <article className="island-shell rounded-[1.75rem] p-5">
            <p className="island-kicker mb-3">Why This Demo</p>
            <p className="m-0 text-sm leading-7 text-[var(--sea-ink-soft)]">
              This route exercises the full loop: optimistic insert, update,
              and delete on the client, then `txid`-based reconciliation once
              Electric confirms the transaction from Postgres.
            </p>
          </article>
        </aside>
      </section>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white/50 px-4 py-4">
      <p className="m-0 text-xs font-semibold tracking-[0.18em] text-[var(--kicker)] uppercase">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">
        {value}
      </p>
    </div>
  )
}
