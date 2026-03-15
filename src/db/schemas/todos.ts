import { createSelectSchema } from 'drizzle-zod'
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const todos = pgTable('todos', {
  id: uuid().primaryKey(),
  text: text().notNull(),
  completed: boolean().notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const todoSchema = createSelectSchema(todos, {
  text: (s) => s.trim().min(1, 'Todo text is required.'),
})
