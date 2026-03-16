import { createSelectSchema } from 'drizzle-orm/zod'
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const simpleListItems = pgTable('simple_list_items', {
  id: uuid().primaryKey(),
  label: text().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const simpleListItem = createSelectSchema(simpleListItems, {
  id: (s) => s.brand<'simple_list_items'>(),
  label: (s) => s.trim().min(1, 'List item text is required.'),
})

export const simpleListItemServerSchema = {
  row: simpleListItem,
  insert: simpleListItem,
  update: simpleListItem
    .omit({ createdAt: true })
    .partial()
    .required({ id: true }),
  delete: simpleListItem.pick({ id: true }),
}

export const simpleListItemClientSchema = {
  id: simpleListItem.shape.id,
  add: simpleListItem.pick({ label: true }),
}
