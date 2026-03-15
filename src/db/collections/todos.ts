import { snakeCamelMapper } from '@electric-sql/client'
import { electricCollectionOptions } from '@tanstack/electric-db-collection'
import { createCollection } from '@tanstack/react-db'

import { todoSchema } from '#/db/schemas/todos'
import { createTodo, deleteTodo, updateTodo } from '#/lib/electric-demo-fns'

export const todoCollection = createCollection(
  electricCollectionOptions({
    id: 'todos',
    schema: todoSchema,
    getKey: (row) => row.id,
    shapeOptions: {
      url: '/api/electric/todos',
      columnMapper: snakeCamelMapper(),
      parser: {
        timestamptz: (value: string) => new Date(value),
      },
    },
    onInsert: async ({ transaction }) => {
      const todo = transaction.mutations[0].modified
      const { txid } = await createTodo({ data: todo })
      return { txid }
    },
    onUpdate: async ({ transaction }) => {
      const { original, changes } = transaction.mutations[0]
      const { txid } = await updateTodo({
        data: {
          id: original.id,
          ...changes,
        },
      })
      return { txid }
    },
    onDelete: async ({ transaction }) => {
      const todo = transaction.mutations[0].original
      const { txid } = await deleteTodo({
        data: { id: todo.id },
      })
      return { txid }
    },
  }),
)
