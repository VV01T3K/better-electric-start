import { useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

import AuthCard from '#/components/AuthCard'
import { authClient } from '#/integrations/better-auth/client'

const authSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/sign-in')({
  validateSearch: authSearchSchema,
  beforeLoad: async ({ context }) => {
    const { session } = context

    if (session) {
      throw redirect({ to: '/demo/db/todos' })
    }
  },
  component: SignInPage,
})

function SignInPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    const { error } = await authClient.signIn.email({
      email,
      password,
    })

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(error.message || 'Unable to sign in.')
      return
    }

    if (search.redirect) {
      window.location.assign(search.redirect)
      return
    }

    await navigate({ to: '/demo/db/todos' })
  }

  return (
    <AuthCard
      title="Sign in"
      description="Access your private Electric-synced todos and the shared live list."
      footerText="Need an account?"
      footerHref="/sign-up"
      footerLabel="Create one"
    >
      <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        <label className="block space-y-2 text-sm text-(--sea-ink)">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-(--line) px-3 py-2 outline-none transition focus:border-(--lagoon-deep)"
          />
        </label>

        <label className="block space-y-2 text-sm text-(--sea-ink)">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-(--line) px-3 py-2 outline-none transition focus:border-(--lagoon-deep)"
          />
        </label>

        {errorMessage ? (
          <p className="text-sm text-red-600">{errorMessage}</p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-(--lagoon-deep) px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthCard>
  )
}
