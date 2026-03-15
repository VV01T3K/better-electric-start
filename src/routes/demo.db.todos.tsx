import { useState } from 'react'
import type { FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from '@tanstack/react-db'

import { todoCollection } from '#/db/collections/todos'

export const Route = createFileRoute('/demo/db/todos')({
  ssr: false,
  loader: () => {
    todoCollection.preload()
  },
  component: TodoDemoPage,
})

function TodoDemoPage() {
  const [draft, setDraft] = useState('')
  const { data: todos, isLoading } = useLiveQuery(
    (query) =>
      query
        .from({ todo: todoCollection })
        .orderBy(({ todo }) => todo.createdAt, 'desc'),
    [],
  )
  const todoItems = todos ?? []

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return

    todoCollection.insert({
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date(),
    })
    setDraft('')
  }

  return (
    <main className="page-wrap px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-[var(--sea-ink)]">Synced Todos</h1>

      <form className="mb-6 flex gap-2" onSubmit={handleSubmit}>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add a todo..."
          className="min-w-0 flex-1 rounded border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--lagoon-deep)]"
        />
        <button
          type="submit"
          className="rounded border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--lagoon-deep)] hover:bg-gray-50"
        >
          Add
        </button>
      </form>

      <div className="space-y-2">
        {isLoading ? (
          <p className="text-sm text-[var(--sea-ink-soft)]">Connecting...</p>
        ) : todoItems.length === 0 ? (
          <p className="text-sm text-[var(--sea-ink-soft)]">No todos yet.</p>
        ) : (
          todoItems.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 rounded border border-[var(--line)] px-3 py-2"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => {
                  todoCollection.update(todo.id, (d) => {
                    d.completed = !d.completed
                  })
                }}
              />
              <span
                className={`flex-1 text-sm ${
                  todo.completed ? 'text-[var(--sea-ink-soft)] line-through' : 'text-[var(--sea-ink)]'
                }`}
              >
                {todo.text}
              </span>
              <button
                type="button"
                onClick={() => todoCollection.delete(todo.id)}
                className="text-xs text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  )
}
