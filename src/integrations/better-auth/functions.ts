import { createServerFn } from '@tanstack/react-start'

import {
  getCurrentSession,
  requireCurrentSession,
} from '#/integrations/better-auth/session.server'

export const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  return getCurrentSession()
})

export const requireSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    return requireCurrentSession()
  },
)
