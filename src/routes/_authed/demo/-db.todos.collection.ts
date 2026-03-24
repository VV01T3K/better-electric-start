import { todoServerSchema } from '#/db/schemas'
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

void demoTodoCollectionPreloadPromise
