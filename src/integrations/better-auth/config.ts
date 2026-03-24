import '@tanstack/react-start/server-only'

import { betterAuth } from 'better-auth/minimal'
import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { ENV } from 'varlock/env'

import { db } from '#/db'
import * as schema from '#/db/tables/_schema'

const DEVELOPMENT_SECRET =
  'dev-only-better-auth-secret-change-this-before-production'

function readBetterAuthSecret() {
  const secret =
    ENV.BETTER_AUTH_SECRET ??
    (process.env.NODE_ENV === 'production' ? undefined : DEVELOPMENT_SECRET)

  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET is required in production.')
  }

  return secret
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    schema,
    provider: 'pg',
    transaction: true,
    camelCase: false,
    usePlural: true,
  }),
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
  experimental: {
    joins: true,
  },
  baseURL: ENV.BETTER_AUTH_URL,
  secret: readBetterAuthSecret(),
  emailAndPassword: {
    enabled: true,
  },
  rateLimit: {
    enabled: false,
  },
  plugins: [tanstackStartCookies()],
})
