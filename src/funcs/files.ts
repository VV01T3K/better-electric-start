import { createServerFn } from "@tanstack/react-start";
import { count, eq } from "drizzle-orm";

import { db } from "#/db";
import { fileServerSchema } from "#/db/schemas/files";
import { files } from "#/db/tables/files";
import {
	FileStorageError,
	deleteStoredFile,
} from "#/features/files/storage.server";
import { requireSessionMiddleware } from "#/integrations/better-auth/middleware";
import { readTxId } from "#/integrations/electric/read-tx-id";

export const deleteFile = createServerFn({ method: "POST" })
	.middleware([requireSessionMiddleware])
	.inputValidator(fileServerSchema.delete)
	.handler(async ({ data }) => {
		const deletedRecord = await db.transaction(async (tx) => {
			const [record] = await tx
				.select({
					id: files.id,
					storage_key: files.storage_key,
				})
				.from(files)
				.where(eq(files.id, data.id))
				.limit(1);

			if (!record) {
				throw new FileStorageError("File not found.", 404);
			}

			await tx.delete(files).where(eq(files.id, data.id));

			return {
				storageKey: record.storage_key,
				txid: await readTxId(tx),
			};
		});

		await deleteStoredFile(deletedRecord.storageKey, {
			ignoreMissing: true,
		});

		return { txid: deletedRecord.txid };
	});

export const getFileCount = createServerFn({ method: "GET" })
	.middleware([requireSessionMiddleware])
	.handler(async () => {
		const [result] = await db
			.select({
				count: count(),
			})
			.from(files);

		return result?.count ?? 0;
	});
