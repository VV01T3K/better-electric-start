import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { authClient } from '#/integrations/better-auth/client'
import { useSession } from '#/integrations/better-auth/useSession'

export default function Header() {
  const navigate = useNavigate()
  const { data: session, isPending } = useSession()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    setIsSigningOut(true)

    const { error } = await authClient.signOut()

    setIsSigningOut(false)

    if (!error) {
      await navigate({ to: '/sign-in' })
    }
  }

  return (
    <header className="border-b border-(--line) px-4">
      <nav className="page-wrap flex items-center gap-4 py-3">
        <Link
          to="/"
          className="text-sm font-semibold text-(--sea-ink) no-underline"
        >
          Home
        </Link>
        {session?.user ? (
          <>
            <Link
              to="/demo/db/todos"
              className="text-sm text-(--sea-ink-soft) no-underline hover:text-(--sea-ink)"
            >
              Todos
            </Link>
            <Link
              to="/demo/db/simple-list"
              className="text-sm text-(--sea-ink-soft) no-underline hover:text-(--sea-ink)"
            >
              Simple List
            </Link>
          </>
        ) : null}
        <div className="ml-auto flex items-center gap-3">
          {session?.user ? (
            <>
              <span className="hidden text-sm text-(--sea-ink-soft) sm:inline">
                {session.user.email}
              </span>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={isSigningOut}
                className="rounded-full border border-(--line) px-3 py-1.5 text-sm text-(--sea-ink) transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSigningOut ? 'Signing out...' : 'Sign out'}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/sign-in"
                className="text-sm text-(--sea-ink-soft) no-underline hover:text-(--sea-ink)"
              >
                Sign in
              </Link>
              <Link
                to="/sign-up"
                className="rounded-full bg-(--lagoon-deep) px-3 py-1.5 text-sm font-medium text-white no-underline transition hover:opacity-90"
              >
                {isPending ? '...' : 'Sign up'}
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
