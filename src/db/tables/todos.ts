import '@tanstack/react-start/server-only'

import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { todoServerSchema } from '#/db/schemas/todos'
import { assertTableSchema } from '#/db/typecheck'
import { user } from './auth'

export const todos = pgTable('todos', {
  id: uuid().primaryKey(),
  text: text().notNull(),
  completed: boolean().notNull().default(false),
  user_id: uuid()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  created_at: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow(),
})

void assertTableSchema(todos)(todoServerSchema.row)
