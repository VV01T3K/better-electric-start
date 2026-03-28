import "@tanstack/react-start/server-only";
import { defineRelationsPart } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { fileServerSchema } from "#/db/schemas/files";
import { assertTableSchema } from "#/db/typecheck";

import { users } from "./auth.gen";

export const files = pgTable("files", {
	id: uuid().primaryKey(),
	storage_key: text().notNull().unique(),
	original_name: text().notNull(),
	content_type: text().notNull(),
	size_bytes: integer().notNull(),
	user_id: uuid()
		.notNull()
		.references(() => users.id, { onDelete: "restrict" }),
	created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
	updated_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const fileRelations = defineRelationsPart({ files, users }, (r) => ({
	users: {
		files: r.many.files({
			from: r.users.id,
			to: r.files.user_id,
		}),
	},
	files: {
		user: r.one.users({
			from: r.files.user_id,
			to: r.users.id,
		}),
	},
}));

void assertTableSchema(files)(fileServerSchema.row);
