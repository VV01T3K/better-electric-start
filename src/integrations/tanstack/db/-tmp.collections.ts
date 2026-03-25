// * Temporary home for collections until TanStack DB supports SSR cleanly. * //

import { simpleListItemServerSchema, todoServerSchema } from '#/db/schemas'
import { insertSimpleListItem } from '#/funcs/simple-list-items'
import { deleteTodo, insertTodo, updateTodo } from '#/funcs/todos'
import { createElectricCollection } from '#/integrations/electric/collection'

function getDemoTodoCollectionUrl() {
  const path = '/api/electric/todos'

  if (typeof window === 'undefined') {
    return path
  }

  const url = new URL(path, window.location.origin)

  // Temporary refresh workaround for this route only. Easy to delete later.
  url.searchParams.set('demo-refresh', String(Date.now()))

  return url.toString()
}

function getDemoSimpleListCollectionUrl() {
  const path = '/api/electric/simple-list-items'

  if (typeof window === 'undefined') {
    return path
  }

  const url = new URL(path, window.location.origin)

  // Temporary refresh workaround for this route only. Easy to delete later.
  url.searchParams.set('demo-refresh', String(Date.now()))

  return url.toString()
}

export const demoTodoCollection = createElectricCollection({
  id: 'todos-demo-route',
  schema: todoServerSchema.row,
  onInsert: insertTodo,
  onUpdate: updateTodo,
  onDelete: deleteTodo,
  url: getDemoTodoCollectionUrl(),
})

export const demoTodoCollectionPreloadPromise =
  typeof window === 'undefined' ? null : demoTodoCollection.preload()

export const demoSimpleListCollection = createElectricCollection({
  id: 'simple-list-demo-route',
  schema: simpleListItemServerSchema.row,
  onInsert: insertSimpleListItem,
  url: getDemoSimpleListCollectionUrl(),
})

export const demoSimpleListCollectionPreloadPromise =
  typeof window === 'undefined' ? null : demoSimpleListCollection.preload()

void demoTodoCollectionPreloadPromise
void demoSimpleListCollectionPreloadPromise
