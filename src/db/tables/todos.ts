import "@tanstack/react-start/server-only";
import { defineRelationsPart } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { todoServerSchema } from "#/db/schemas/todos";
import { assertTableSchema } from "#/db/typecheck";

import { users } from "./auth.gen";

export const todos = pgTable("todos", {
	id: uuid().primaryKey(),
	text: text().notNull(),
	completed: boolean().notNull().default(false),
	user_id: uuid()
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
	updated_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const todoRelations = defineRelationsPart({ users, todos }, (r) => ({
	users: {
		todos: r.many.todos({
			from: r.users.id,
			to: r.todos.user_id,
		}),
	},
	todos: {
		user: r.one.users({
			from: r.todos.user_id,
			to: r.users.id,
		}),
	},
}));

void assertTableSchema(todos)(todoServerSchema.row);
