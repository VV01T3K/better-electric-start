import { useState } from 'react'
import type { FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from '@tanstack/react-db'

import { simpleListCollection } from '#/db/collections/simple-list-items'

export const Route = createFileRoute('/demo/db/simple-list')({
  ssr: false,
  loader: async () => {
    await simpleListCollection.preload()
    return null
  },
  component: SimpleListDemoPage,
})

function SimpleListDemoPage() {
  const [draft, setDraft] = useState('')
  const { data: items, isLoading } = useLiveQuery(
    (query) =>
      query
        .from({ item: simpleListCollection })
        .orderBy(({ item }) => item.createdAt, 'desc'),
    [],
  )
  const listItems = items ?? []

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const label = draft.trim()
    if (!label) return

    simpleListCollection.insert({
      id: crypto.randomUUID(),
      label,
      createdAt: new Date(),
    })
    setDraft('')
  }

  return (
    <main className="page-wrap px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-[var(--sea-ink)]">Simple List</h1>

      <form className="mb-6 flex gap-2" onSubmit={handleSubmit}>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add an item..."
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
        ) : listItems.length === 0 ? (
          <p className="text-sm text-[var(--sea-ink-soft)]">No items yet.</p>
        ) : (
          listItems.map((item) => (
            <div
              key={item.id}
              className="rounded border border-[var(--line)] px-3 py-2 text-sm text-[var(--sea-ink)]"
            >
              {item.label}
            </div>
          ))
        )}
      </div>
    </main>
  )
}
