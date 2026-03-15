import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="page-wrap px-4 py-12">
      <h1 className="mb-4 text-3xl font-bold text-[var(--sea-ink)]">
        TanStack Start
      </h1>
      <p className="text-[var(--sea-ink-soft)]">
        A minimal starter with type-safe routing, server functions, and Electric SQL sync.
      </p>
    </main>
  )
}
