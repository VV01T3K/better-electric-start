import { todoServerSchema, simpleListItemServerSchema } from '#/db/schemas'
import { createElectricCollection } from '#/integrations/electric/collection'

import { insertSimpleListItem } from '#/funcs/simple-list-items'
import { insertTodo, deleteTodo, updateTodo } from '#/funcs/todos'

export const todoCollection = createElectricCollection({
  id: 'todos',
  schema: todoServerSchema.row,
  onInsert: insertTodo,
  onUpdate: updateTodo,
  onDelete: deleteTodo,
})

export const simpleListCollection = createElectricCollection({
  id: 'simple-list-items',
  schema: simpleListItemServerSchema.row,
  onInsert: insertSimpleListItem,
})
