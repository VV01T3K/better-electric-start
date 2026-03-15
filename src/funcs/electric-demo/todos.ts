import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'

import { db } from '#/db'
import { todoSchema, todos } from '#/db/schemas/todos'

import { readTxId } from '../../integrations/electric/read-tx-id'

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
