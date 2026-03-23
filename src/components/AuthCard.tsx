import { Link } from '@tanstack/react-router'

type AuthCardProps = {
  title: string
  description: string
  footerText: string
  footerHref: string
  footerLabel: string
  children: React.ReactNode
}

export default function AuthCard({
  title,
  description,
  footerText,
  footerHref,
  footerLabel,
  children,
}: AuthCardProps) {
  return (
    <main className="page-wrap px-4 py-12">
      <section className="mx-auto max-w-md rounded-3xl border border-[var(--line)] bg-white/80 p-8 shadow-sm">
        <header className="mb-6 space-y-2">
          <p className="text-sm uppercase tracking-[0.22em] text-[var(--sea-ink-soft)]">
            Better Auth
          </p>
          <h1 className="text-2xl font-bold text-[var(--sea-ink)]">{title}</h1>
          <p className="text-sm text-[var(--sea-ink-soft)]">{description}</p>
        </header>

        {children}

        <p className="mt-6 text-sm text-[var(--sea-ink-soft)]">
          {footerText}{' '}
          <Link
            to={footerHref}
            className="font-medium text-[var(--lagoon-deep)] no-underline"
          >
            {footerLabel}
          </Link>
        </p>
      </section>
    </main>
  )
}
