import { simpleListItemSchema } from '#/db/schemas/simple-list-items'
import { todoSchema } from '#/db/schemas/todos'
import { createElectricCollection } from '#/integrations/electric/collection'

import { createSimpleListItem } from '#/funcs/simple-list-items'
import { createTodo, deleteTodo, updateTodo } from '#/funcs/todos'

export const todoCollection = createElectricCollection({
  id: 'todos',
  schema: todoSchema,
  onInsert: createTodo,
  onUpdate: updateTodo,
  onDelete: deleteTodo,
})

export const simpleListCollection = createElectricCollection({
  id: 'simple-list-items',
  schema: simpleListItemSchema,
  onInsert: createSimpleListItem,
})
