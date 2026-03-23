import { createServerFn } from '@tanstack/react-start'

import { db } from '#/db'
import { simpleListItemServerSchema } from '#/db/schemas/simple-list-items'
import { simpleListItems } from '#/db/tables/simple-list-items'

import { readTxId } from '#/integrations/electric/read-tx-id'

export const insertSimpleListItem = createServerFn()
  .inputValidator(simpleListItemServerSchema.insert)
  .handler(async ({ data }) => {
    return db.transaction(async (tx) => {
      await tx.insert(simpleListItems).values({
        id: data.id,
        label: data.label,
        created_at: data.created_at,
      })

      return { txid: await readTxId(tx) }
    })
  })
