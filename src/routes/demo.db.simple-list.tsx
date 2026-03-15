import { useState } from 'react'
import type { FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from '@tanstack/react-db'

import { simpleListCollection } from '#/db/collections'

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
        .orderBy(({ item }) => item.created_at, 'desc'),
    [],
  )
  const listItems = items ?? []

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const label = draft.trim()
    if (!label) {
      return
    }

    simpleListCollection.insert({
      id: crypto.randomUUID(),
      label,
      created_at: new Date(),
    })

    setDraft('')
  }

  return (
    <main className="page-wrap px-4 pb-10 pt-14">
      <section className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10">
        <p className="island-kicker mb-3">Minimal Sync Example</p>
        <h1 className="display-title max-w-3xl text-4xl leading-tight font-bold text-[var(--sea-ink)] sm:text-5xl">
          The smallest live list in this repo.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--sea-ink-soft)]">
          This page keeps the idea intentionally narrow: one collection, one
          input, one server write, and one live query fed by Electric.
        </p>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="island-shell rounded-[1.75rem] p-6">
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="simple-list-label">
              List item text
            </label>
            <input
              id="simple-list-label"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Add one synced list item"
              className="min-w-0 flex-1 rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3 text-[var(--sea-ink)] outline-none transition focus:border-[var(--lagoon-deep)] focus:bg-white"
            />
            <button
              type="submit"
              className="rounded-2xl border border-[rgba(50,143,151,0.35)] bg-[rgba(79,184,178,0.18)] px-5 py-3 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.28)]"
            >
              Add item
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {isLoading ? (
              <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
                Waiting for the initial Electric snapshot...
              </p>
            ) : listItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/35 px-5 py-8 text-center text-sm text-[var(--sea-ink-soft)]">
                No list items yet. Add one to see the smallest end-to-end
                Electric sync flow in this starter.
              </div>
            ) : (
              listItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white/55 px-4 py-3"
                >
                  <div>
                    <p className="m-0 text-sm font-medium text-[var(--sea-ink)]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
                      Item #{listItems.length - index} ·{' '}
                      {item.created_at.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <aside className="island-shell rounded-[1.75rem] p-5">
          <p className="island-kicker mb-3">What It Shows</p>
          <p className="m-0 text-sm leading-7 text-[var(--sea-ink-soft)]">
            The simple list keeps writes add-only so the whole stack is easier
            to inspect: client-generated UUID, optimistic collection insert,
            one server function, one Postgres transaction id, and one Electric
            shape stream.
          </p>
        </aside>
      </section>
    </main>
  )
}
