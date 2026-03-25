export type {
  ElectricProxySession,
  ElectricShapeDefinition,
  ElectricShapeMainFilter,
} from '../metadata'

import type {
  ElectricProxySession,
  ElectricShapeDefinition,
} from '../metadata'

import { getRegisteredElectricShapeDefinitions } from '../metadata'

export type AuthorizedElectricProxyContext = {
  shape: ElectricShapeDefinition
  session?: ElectricProxySession
}

async function getElectricShapeDefinitions() {
  await import('#/db/collections')
  return getRegisteredElectricShapeDefinitions()
}

function createProxyErrorResponse(
  status: 401 | 404,
  error: string,
  headers?: HeadersInit,
) {
  return Response.json(
    { error },
    {
      status,
      headers,
    },
  )
}

export async function authorizeElectricShapeRequest(options: {
  shapeName: string | undefined
  getSession: () => Promise<ElectricProxySession | null | undefined>
  shapeDefinitions?: Record<string, ElectricShapeDefinition>
  getShapeDefinitions?: () => Promise<Record<string, ElectricShapeDefinition>>
}) {
  const shapeDefinitions =
    options.shapeDefinitions ??
    (await (options.getShapeDefinitions?.() ?? getElectricShapeDefinitions()))

  const shape = options.shapeName
    ? shapeDefinitions[options.shapeName]
    : undefined

  if (!shape) {
    return createProxyErrorResponse(404, 'Shape not found.')
  }

  if (!shape.requiresAuth) {
    return {
      shape,
    }
  }

  const session = await options.getSession()

  if (!session) {
    return createProxyErrorResponse(401, 'Unauthorized.', {
      Vary: 'Cookie',
    })
  }

  return {
    shape,
    session,
  }
}
