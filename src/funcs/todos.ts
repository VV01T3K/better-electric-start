import { createServerFn } from "@tanstack/react-start";
import { and, count, eq } from "drizzle-orm";

import { db } from "#/db";
import { todoServerSchema } from "#/db/schemas/todos";
import { todos } from "#/db/tables/todos";
import { requireSessionMiddleware } from "#/integrations/better-auth/middleware";
import { readTxId } from "#/integrations/electric/read-tx-id";

export const insertTodo = createServerFn({ method: "POST" })
	.middleware([requireSessionMiddleware])
	.inputValidator(todoServerSchema.insert)
	.handler(async ({ context, data }) => {
		return db.transaction(async (tx) => {
			await tx.insert(todos).values({
				id: data.id,
				text: data.text,
				completed: data.completed,
				user_id: context.session.user.id,
				created_at: data.created_at,
			});

			return { txid: await readTxId(tx) };
		});
	});

export const updateTodo = createServerFn({ method: "POST" })
	.middleware([requireSessionMiddleware])
	.inputValidator(todoServerSchema.update)
	.handler(async ({ context, data }) => {
		return db.transaction(async (tx) => {
			const values: Partial<typeof todos.$inferInsert> = {};

			if (typeof data.text !== "undefined") {
				values.text = data.text;
			}

			if (typeof data.completed !== "undefined") {
				values.completed = data.completed;
			}

			await tx
				.update(todos)
				.set(values)
				.where(
					and(
						eq(todos.id, data.id),
						eq(todos.user_id, context.session.user.id),
					),
				);

			return { txid: await readTxId(tx) };
		});
	});

export const deleteTodo = createServerFn({ method: "POST" })
	.middleware([requireSessionMiddleware])
	.inputValidator(todoServerSchema.delete)
	.handler(async ({ context, data }) => {
		return db.transaction(async (tx) => {
			await tx
				.delete(todos)
				.where(
					and(
						eq(todos.id, data.id),
						eq(todos.user_id, context.session.user.id),
					),
				);

			return { txid: await readTxId(tx) };
		});
	});

export const getTodoCount = createServerFn({ method: "GET" })
	.middleware([requireSessionMiddleware])
	.handler(async ({ context }) => {
		const [result] = await db
			.select({
				count: count(),
			})
			.from(todos)
			.where(eq(todos.user_id, context.session.user.id));

		return result?.count ?? 0;
	});
