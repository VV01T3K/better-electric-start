import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'

import { db } from '#/db'
import { todoServerSchema } from '#/db/schemas/todos'
import { todos } from '#/db/tables/todos'

import { readTxId } from '#/integrations/electric/read-tx-id'
import { requireCurrentSession } from '#/integrations/better-auth/session.server'

export const insertTodo = createServerFn({ method: 'POST' })
  .inputValidator(todoServerSchema.insert)
  .handler(async ({ data }) => {
    const session = await requireCurrentSession()

    return db.transaction(async (tx) => {
      await tx.insert(todos).values({
        id: data.id,
        text: data.text,
        completed: data.completed,
        user_id: session.user.id,
        created_at: data.created_at,
      })

      return { txid: await readTxId(tx) }
    })
  })

export const updateTodo = createServerFn({ method: 'POST' })
  .inputValidator(todoServerSchema.update)
  .handler(async ({ data }) => {
    const session = await requireCurrentSession()

    return db.transaction(async (tx) => {
      const values: Partial<typeof todos.$inferInsert> = {}

      if (typeof data.text !== 'undefined') {
        values.text = data.text
      }

      if (typeof data.completed !== 'undefined') {
        values.completed = data.completed
      }

      await tx
        .update(todos)
        .set(values)
        .where(
          and(eq(todos.id, data.id), eq(todos.user_id, session.user.id)),
        )

      return { txid: await readTxId(tx) }
    })
  })

export const deleteTodo = createServerFn({ method: 'POST' })
  .inputValidator(todoServerSchema.delete)
  .handler(async ({ data }) => {
    const session = await requireCurrentSession()

    return db.transaction(async (tx) => {
      await tx
        .delete(todos)
        .where(and(eq(todos.id, data.id), eq(todos.user_id, session.user.id)))

      return { txid: await readTxId(tx) }
    })
  })
