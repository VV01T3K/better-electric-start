import '@tanstack/react-start/server-only'

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

import { db } from '#/db'
import * as schema from '#/db/schema'

const DEVELOPMENT_SECRET =
  'dev-only-better-auth-secret-change-this-before-production'

function readBetterAuthSecret() {
  const secret =
    process.env.BETTER_AUTH_SECRET ??
    (process.env.NODE_ENV === 'production' ? undefined : DEVELOPMENT_SECRET)

  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET is required in production.')
  }

  return secret
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  secret: readBetterAuthSecret(),
  emailAndPassword: {
    enabled: true,
  },
  rateLimit: {
    enabled: false,
  },
  plugins: [tanstackStartCookies()],
})
