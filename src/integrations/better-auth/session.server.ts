import '@tanstack/react-start/server-only'

import { getRequestHeaders } from '@tanstack/react-start/server'

import { auth } from '#/integrations/better-auth/config'

export async function getSessionFromHeaders(headers: Headers) {
  return auth.api.getSession({
    headers,
  })
}

export async function requireSessionFromHeaders(headers: Headers) {
  const session = await getSessionFromHeaders(headers)

  if (!session) {
    throw new Error('Unauthorized')
  }

  return session
}

export function getCurrentRequestHeaders() {
  return new Headers(getRequestHeaders())
}

export async function getCurrentSession() {
  return getSessionFromHeaders(getCurrentRequestHeaders())
}

export async function requireCurrentSession() {
  return requireSessionFromHeaders(getCurrentRequestHeaders())
}
