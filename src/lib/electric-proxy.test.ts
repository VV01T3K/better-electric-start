import { describe, expect, it, vi } from 'vitest'

import {
  buildElectricShapeUrl,
  createElectricProxyHandler,
  isElectricTable,
} from '#/lib/electric-proxy'

describe('electric proxy helpers', () => {
  it('recognizes allowed tables', () => {
    expect(isElectricTable('todos')).toBe(true)
    expect(isElectricTable('simple_list_items')).toBe(true)
    expect(isElectricTable('users')).toBe(false)
    expect(isElectricTable(null)).toBe(false)
  })

  it('builds an upstream Electric shape URL from forwarded params', () => {
    const request = new Request(
      'http://localhost:3000/api/electric?table=todos&handle=abc123&offset=now&live=true&ignored=value',
    )

    const upstreamUrl = buildElectricShapeUrl(request, {
      electricUrl: 'http://localhost:4000',
      table: 'todos',
      sourceId: 'src_123',
      secret: 'secret_456',
    })

    expect(upstreamUrl.toString()).toBe(
      'http://localhost:4000/v1/shape?handle=abc123&offset=now&live=true&table=todos&source_id=src_123&secret=secret_456',
    )
  })

  it('returns 400 for a disallowed table before calling upstream', async () => {
    const fetchImpl = vi.fn<typeof fetch>()
    const handler = createElectricProxyHandler({
      electricUrl: 'http://localhost:4000',
      fetchImpl,
    })

    const response = await handler(
      new Request('http://localhost:3000/api/electric?table=users'),
    )

    expect(response.status).toBe(400)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('proxies valid Electric requests upstream', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('[]', {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'content-length': '2',
        },
      }),
    )
    const handler = createElectricProxyHandler({
      electricUrl: 'http://localhost:4000',
      fetchImpl,
    })

    const response = await handler(
      new Request(
        'http://localhost:3000/api/electric?table=simple_list_items&offset=now',
      ),
    )

    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(String(fetchImpl.mock.calls[0]?.[0])).toBe(
      'http://localhost:4000/v1/shape?offset=now&table=simple_list_items',
    )
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('[]')
  })
})
