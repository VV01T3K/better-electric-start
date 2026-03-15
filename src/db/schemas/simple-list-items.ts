import { createSelectSchema } from 'drizzle-zod'
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const simpleListItems = pgTable('simple_list_items', {
  id: uuid().primaryKey(),
  label: text().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const simpleListItemSchema = createSelectSchema(simpleListItems, {
  label: (s) => s.trim().min(1, 'List item text is required.'),
})
