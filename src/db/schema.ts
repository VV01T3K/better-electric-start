import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const todos = pgTable('todos', {
  id: uuid().primaryKey(),
  text: text().notNull(),
  completed: boolean().notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const simpleListItems = pgTable('simple_list_items', {
  id: uuid().primaryKey(),
  label: text().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
