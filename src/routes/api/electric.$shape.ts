import { createFileRoute } from '@tanstack/react-router'

import { createElectricProxyHandler } from '#/integrations/electric/proxy'

const handleElectricProxyRequest = createElectricProxyHandler({
  electricUrl: process.env.ELECTRIC_URL ?? 'http://localhost:4000',
  sourceId: process.env.ELECTRIC_SOURCE_ID,
  secret: process.env.ELECTRIC_SECRET,
})

export const Route = createFileRoute('/api/electric/$shape')({
  server: {
    handlers: {
      GET: ({ request, params }) =>
        handleElectricProxyRequest(request, params.shape),
    },
  },
})
