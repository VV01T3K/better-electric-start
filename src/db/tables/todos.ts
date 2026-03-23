import '@tanstack/react-start/server-only'

import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import type { Todo } from '#/db/schemas/todos'
import type { Equal, Expect } from '#/db/typecheck'

export const todos = pgTable('todos', {
  id: uuid().primaryKey(),
  text: text().notNull(),
  completed: boolean().notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type TodoTableMatchesContract = Expect<
  Equal<typeof todos.$inferSelect, Todo>
>
