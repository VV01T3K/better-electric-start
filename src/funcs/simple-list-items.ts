import { createServerFn } from "@tanstack/react-start";
import { count } from "drizzle-orm";

import { db } from "#/db";
import { simpleListItemServerSchema } from "#/db/schemas/simple-list-items";
import { simpleListItems } from "#/db/tables/simple-list-items";
import { requireSessionMiddleware } from "#/integrations/better-auth/middleware";
import { readTxId } from "#/integrations/electric/read-tx-id";

export const insertSimpleListItem = createServerFn({ method: "POST" })
	.middleware([requireSessionMiddleware])
	.inputValidator(simpleListItemServerSchema.insert)
	.handler(async ({ data }) => {
		return db.transaction(async (tx) => {
			await tx.insert(simpleListItems).values({
				id: data.id,
				label: data.label,
				created_at: data.created_at,
			});

			return { txid: await readTxId(tx) };
		});
	});

export const getSimpleListItemCount = createServerFn({ method: "GET" })
	.middleware([requireSessionMiddleware])
	.handler(async () => {
		const [result] = await db
			.select({
				count: count(),
			})
			.from(simpleListItems);

		return result?.count ?? 0;
	});
