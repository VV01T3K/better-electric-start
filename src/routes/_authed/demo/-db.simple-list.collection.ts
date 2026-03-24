import { simpleListItemServerSchema } from '#/db/schemas'
import { insertSimpleListItem } from '#/funcs/simple-list-items'
import { createElectricCollection } from '#/integrations/electric/collection'

function getDemoSimpleListCollectionUrl() {
  const path = '/api/electric/simple-list-items'

  if (typeof window === 'undefined') {
    return path
  }

  const url = new URL(path, window.location.origin)

  // Temporary refresh workaround for this route only. Easy to delete later.
  url.searchParams.set('demo-refresh', String(Date.now()))

  return url.toString()
}

export const demoSimpleListCollection = createElectricCollection({
  id: 'simple-list-demo-route',
  schema: simpleListItemServerSchema.row,
  onInsert: insertSimpleListItem,
  url: getDemoSimpleListCollectionUrl(),
})

export const demoSimpleListCollectionPreloadPromise =
  typeof window === 'undefined' ? null : demoSimpleListCollection.preload()

void demoSimpleListCollectionPreloadPromise
