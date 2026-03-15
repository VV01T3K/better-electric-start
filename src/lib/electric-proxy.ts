import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from '@electric-sql/client'

type ElectricProxyOptions = {
  electricUrl: string
  sourceId?: string
  secret?: string
  fetchImpl?: typeof fetch
}

export function buildElectricShapeUrl(
  request: Request,
  options: {
    electricUrl: string
    shape: string
    sourceId?: string
    secret?: string
  },
) {
  const requestUrl = new URL(request.url)
  const upstreamUrl = new URL('/v1/shape', options.electricUrl)

  requestUrl.searchParams.forEach((value, key) => {
    if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
      upstreamUrl.searchParams.set(key, value)
    }
  })

  upstreamUrl.searchParams.set('table', options.shape.replaceAll('-', '_'))

  if (options.sourceId) {
    upstreamUrl.searchParams.set('source_id', options.sourceId)
  }

  if (options.secret) {
    upstreamUrl.searchParams.set('secret', options.secret)
  }

  return upstreamUrl
}

export function createElectricProxyHandler({
  electricUrl,
  sourceId,
  secret,
  fetchImpl = fetch,
}: ElectricProxyOptions) {
  return async function handleElectricProxyRequest(
    request: Request,
    shape: string | undefined,
  ) {
    if (!shape) {
      return Response.json(
        { error: 'Missing shape.' },
        { status: 400 },
      )
    }

    const upstreamUrl = buildElectricShapeUrl(request, {
      electricUrl,
      shape,
      sourceId,
      secret,
    })

    const upstreamResponse = await fetchImpl(upstreamUrl, {
      method: 'GET',
      signal: request.signal,
    })

    const headers = new Headers(upstreamResponse.headers)
    headers.delete('content-encoding')
    headers.delete('content-length')
    headers.delete('access-control-allow-origin')
    headers.delete('access-control-allow-credentials')

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers,
    })
  }
}
