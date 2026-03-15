import { createServerFn } from '@tanstack/react-start'

import { db } from '#/db'
import {
  simpleListItemSchema,
  simpleListItems,
} from '#/db/schemas/simple-list-items'

import { readTxId } from '#/integrations/electric/read-tx-id'

export const createSimpleListItem = createServerFn({ method: 'POST' })
  .inputValidator(
    simpleListItemSchema.pick({
      id: true,
      label: true,
      createdAt: true,
    }),
  )
  .handler(async ({ data }) => {
    return db.transaction(async (tx) => {
      await tx.insert(simpleListItems).values({
        id: data.id,
        label: data.label,
        createdAt: data.createdAt,
      })

      return { txid: await readTxId(tx) }
    })
  })
