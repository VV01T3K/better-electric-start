import { createServerFn } from '@tanstack/react-start'
import { eq, sql } from 'drizzle-orm'

import { db } from '#/db'
import {
  simpleListItemSchema,
  simpleListItems,
} from '#/db/schemas/simple-list-items'
import { todoSchema, todos } from '#/db/schemas/todos'

const updateTodoInputSchema = todoSchema
  .pick({
    id: true,
  })
  .extend({
    text: todoSchema.shape.text.optional(),
    completed: todoSchema.shape.completed.optional(),
  })
  .refine(
    (value) =>
      typeof value.text !== 'undefined' || typeof value.completed !== 'undefined',
    {
      message: 'At least one todo field must be updated.',
      path: ['text'],
    },
  )

const deleteTodoInputSchema = todoSchema.pick({ id: true })

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
    todoSchema.pick({
      id: true,
      text: true,
      completed: true,
      createdAt: true,
    }),
  )
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
