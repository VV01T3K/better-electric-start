import '@tanstack/react-start/server-only'

import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import type { SimpleListItem } from '#/db/schemas/simple-list-items'
import type { Equal, Expect } from '#/db/typecheck'

export const simpleListItems = pgTable('simple_list_items', {
  id: uuid().primaryKey(),
  label: text().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type SimpleListItemTableMatchesContract = Expect<
  Equal<typeof simpleListItems.$inferSelect, SimpleListItem>
>
