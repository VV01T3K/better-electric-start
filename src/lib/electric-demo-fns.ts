import { createServerFn } from '@tanstack/react-start'
import { eq, sql } from 'drizzle-orm'

import { db } from '#/db'
import { simpleListItemRowSchema, todoRowSchema } from '#/db/entities'
import { simpleListItems, todos } from '#/db/schema'

const updateTodoInputSchema = todoRowSchema
  .pick({
    id: true,
  })
  .extend({
    text: todoRowSchema.shape.text.optional(),
    completed: todoRowSchema.shape.completed.optional(),
  })
  .refine(
    (value) =>
      typeof value.text !== 'undefined' || typeof value.completed !== 'undefined',
    {
      message: 'At least one todo field must be updated.',
      path: ['text'],
    },
  )

const deleteTodoInputSchema = todoRowSchema.pick({ id: true })

async function readTxId(tx: Parameters<typeof db.transaction>[0] extends (
  arg: infer T,
) => Promise<unknown>
  ? T
  : never) {
  const result = await tx.execute<{ txid: string }>(
    sql`SELECT pg_current_xact_id()::xid::text AS txid`,
  )
  const txid = Number(result.rows[0]?.txid)

  if (!Number.isInteger(txid)) {
    throw new Error('Failed to read transaction id from Postgres.')
  }

  return txid
}

export const createTodo = createServerFn({ method: 'POST' })
  .inputValidator(
    todoRowSchema.pick({
      id: true,
      text: true,
      completed: true,
      created_at: true,
    }),
  )
  .handler(async ({ data }) => {
    return db.transaction(async (tx) => {
      await tx.insert(todos).values({
        id: data.id,
        text: data.text,
        completed: data.completed,
        createdAt: data.created_at,
      })

      return { txid: await readTxId(tx) }
    })
  })

export const updateTodo = createServerFn({ method: 'POST' })
  .inputValidator(updateTodoInputSchema)
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

export const deleteTodo = createServerFn({ method: 'POST' })
  .inputValidator(deleteTodoInputSchema)
  .handler(async ({ data }) => {
    return db.transaction(async (tx) => {
      await tx.delete(todos).where(eq(todos.id, data.id))

      return { txid: await readTxId(tx) }
    })
  })

export const createSimpleListItem = createServerFn({ method: 'POST' })
  .inputValidator(
    simpleListItemRowSchema.pick({
      id: true,
      label: true,
      created_at: true,
    }),
  )
  .handler(async ({ data }) => {
    return db.transaction(async (tx) => {
      await tx.insert(simpleListItems).values({
        id: data.id,
        label: data.label,
        createdAt: data.created_at,
      })

      return { txid: await readTxId(tx) }
    })
  })
