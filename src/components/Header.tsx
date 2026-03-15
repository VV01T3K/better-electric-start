import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="border-b border-[var(--line)] px-4">
      <nav className="page-wrap flex items-center gap-4 py-3">
        <Link to="/" className="text-sm font-semibold text-[var(--sea-ink)] no-underline">
          Home
        </Link>
        <Link to="/demo/db/todos" className="text-sm text-[var(--sea-ink-soft)] no-underline hover:text-[var(--sea-ink)]">
          Todos
        </Link>
        <Link to="/demo/db/simple-list" className="text-sm text-[var(--sea-ink-soft)] no-underline hover:text-[var(--sea-ink)]">
          Simple List
        </Link>
      </nav>
    </header>
  )
}
