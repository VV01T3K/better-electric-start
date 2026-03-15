import { snakeCamelMapper } from '@electric-sql/client'
import { electricCollectionOptions } from '@tanstack/electric-db-collection'
import { createCollection } from '@tanstack/react-db'

import { simpleListItemSchema } from '#/db/schemas/simple-list-items'
import { todoSchema } from '#/db/schemas/todos'
import {
  createSimpleListItem,
  createTodo,
  deleteTodo,
  updateTodo,
} from '#/lib/electric-demo-fns'

function getElectricShapeUrl() {
  if (typeof window !== 'undefined') {
    return new URL('/api/electric', window.location.origin).toString()
  }

  const appUrl = process.env.VITE_APP_URL ?? 'http://localhost:3000'
  return new URL('/api/electric', appUrl).toString()
}

const shapeParser = {
  timestamptz: (value: string) => new Date(value),
}

export const todoCollection = createCollection(
  electricCollectionOptions({
    id: 'todos',
    schema: todoSchema,
    getKey: (row) => row.id,
    shapeOptions: {
      url: getElectricShapeUrl(),
      params: {
        table: 'todos',
      },
      columnMapper: snakeCamelMapper(),
      parser: shapeParser,
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

export const simpleListCollection = createCollection(
  electricCollectionOptions({
    id: 'simple-list-items',
    schema: simpleListItemSchema,
    getKey: (row) => row.id,
    shapeOptions: {
      url: getElectricShapeUrl(),
      params: {
        table: 'simple_list_items',
      },
      columnMapper: snakeCamelMapper(),
      parser: shapeParser,
    },
    onInsert: async ({ transaction }) => {
      const item = transaction.mutations[0].modified
      const { txid } = await createSimpleListItem({ data: item })
      return { txid }
    },
  }),
)
