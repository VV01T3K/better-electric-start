import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'

import { db } from '#/db'
import { todoServerSchema } from '#/db/schemas/todos'
import { todos } from '#/db/tables/todos'

import { readTxId } from '#/integrations/electric/read-tx-id'

export const insertTodo = createServerFn()
  .inputValidator(todoServerSchema.insert)
  .handler(async ({ data }) => {
    return db.transaction(async (tx) => {
      await tx.insert(todos).values({
        id: data.id,
        text: data.text,
        completed: data.completed,
        createdAt: data.createdAt,
      })

      return { txid: await readTxId(tx) }
    })
  })

export const updateTodo = createServerFn()
  .inputValidator(todoServerSchema.update)
  .handler(async ({ data }) => {
    return db.transaction(async (tx) => {
      const values: Partial<typeof todos.$inferInsert> = {}

      if (typeof data.text !== 'undefined') {
        values.text = data.text
      }

      if (typeof data.completed !== 'undefined') {
        values.completed = data.completed
      }

      await tx.update(todos).set(values).where(eq(todos.id, data.id))

      return { txid: await readTxId(tx) }
    })
  })

export const deleteTodo = createServerFn()
  .inputValidator(todoServerSchema.delete)
  .handler(async ({ data }) => {
    return db.transaction(async (tx) => {
      await tx.delete(todos).where(eq(todos.id, data.id))

      return { txid: await readTxId(tx) }
    })
  })
