import { createFileRoute } from '@tanstack/react-router'
import { ENV } from 'varlock/env'

import { createElectricProxyHandler } from '#/integrations/electric/proxy'

const handleElectricProxyRequest = createElectricProxyHandler({
  electricUrl: ENV.ELECTRIC_URL,
  sourceId: ENV.ELECTRIC_SOURCE_ID,
  secret: ENV.ELECTRIC_SECRET,
})

export const Route = createFileRoute('/api/electric/$shape')({
  server: {
    handlers: {
      GET: ({ request, params }) =>
        handleElectricProxyRequest(request, params.shape),
    },
  },
})
