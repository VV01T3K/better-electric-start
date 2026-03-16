import { createSelectSchema } from 'drizzle-orm/zod'
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const todos = pgTable('todos', {
  id: uuid().primaryKey(),
  text: text().notNull(),
  completed: boolean().notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

const todo = createSelectSchema(todos, {
  id: (s) => s.brand<'todos'>(),
  text: (s) => s.trim().min(1, 'Todo text is required.'),
})

export const todoServerSchema = {
  row: todo,
  insert: todo,
  update: todo
    .omit({ createdAt: true })
    .partial()
    .required({ id: true }),
  delete: todo.pick({ id: true }),
}

export const todoSchema = {
  id: todo.shape.id,
  add: todo.pick({ text: true }),
}
