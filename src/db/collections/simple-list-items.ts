import { snakeCamelMapper } from '@electric-sql/client'
import { electricCollectionOptions } from '@tanstack/electric-db-collection'
import { createCollection } from '@tanstack/react-db'

import { simpleListItemSchema } from '#/db/schemas/simple-list-items'
import { createSimpleListItem } from '#/lib/electric-demo-fns'

export const simpleListCollection = createCollection(
  electricCollectionOptions({
    id: 'simple-list-items',
    schema: simpleListItemSchema,
    getKey: (row) => row.id,
    shapeOptions: {
      url: typeof window !== 'undefined' ? `${window.location.origin}/api/electric/simple-list-items` : '/api/electric/simple-list-items',
      columnMapper: snakeCamelMapper(),
      parser: {
        timestamptz: (value: string) => new Date(value),
      },
    },
    onInsert: async ({ transaction }) => {
      const item = transaction.mutations[0].modified
      const { txid } = await createSimpleListItem({ data: item })
      return { txid }
    },
  }),
)
