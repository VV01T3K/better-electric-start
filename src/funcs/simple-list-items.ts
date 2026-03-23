import { createServerFn } from '@tanstack/react-start'

import { db } from '#/db'
import { simpleListItemServerSchema } from '#/db/schemas/simple-list-items'
import { simpleListItems } from '#/db/tables/simple-list-items'

import { readTxId } from '#/integrations/electric/read-tx-id'
import { requireCurrentSession } from '#/integrations/better-auth/session.server'

export const insertSimpleListItem = createServerFn({ method: 'POST' })
  .inputValidator(simpleListItemServerSchema.insert)
  .handler(async ({ data }) => {
    await requireCurrentSession()

    return db.transaction(async (tx) => {
      await tx.insert(simpleListItems).values({
        id: data.id,
        label: data.label,
        created_at: data.created_at,
      })

      return { txid: await readTxId(tx) }
    })
  })
