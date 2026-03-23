import '@tanstack/react-start/server-only'

import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import type { Todo } from '#/db/schemas/todos'
import type { Equal, Expect } from '#/db/typecheck'
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

export type TodoTableMatchesContract = Expect<
  Equal<typeof todos.$inferSelect, Todo>
>
