import '@tanstack/react-start/server-only'

import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { simpleListItemServerSchema } from '#/db/schemas/simple-list-items'
import { assertTableSchema } from '#/db/typecheck'

export const simpleListItems = pgTable('simple_list_items', {
  id: uuid().primaryKey(),
  label: text().notNull(),
  created_at: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow(),
})

void assertTableSchema(simpleListItems)(simpleListItemServerSchema.row)
