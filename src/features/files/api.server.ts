import "@tanstack/react-start/server-only";
import { createServerFn } from "@tanstack/react-start";
import { count, eq } from "drizzle-orm";

import { db } from "#/db";
import { fileServerSchema } from "#/db/schemas/files";
import { files } from "#/db/tables/files";
import { requireSessionMiddleware } from "#/integrations/better-auth/middleware";
import { readTxId } from "#/integrations/electric/read-tx-id";
import { requireSessionFromHeaders } from "#/integrations/better-auth/session.server";

import {
	FileStorageError,
	buildFileResponseHeaders,
	deleteStoredFile,
	resolveStoragePath,
	saveUploadedFileToDisk,
} from "./storage.server";

type ByteRange =
	| {
			start: number;
			end: number;
	  }
	| "invalid";

const uuidPattern =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createErrorResponse(status: number, error: string) {
	return Response.json({ error }, { status });
}

function toErrorResponse(error: unknown) {
	if (error instanceof FileStorageError) {
		return createErrorResponse(error.status, error.message);
	}

	if (error instanceof TypeError) {
		return createErrorResponse(400, error.message);
	}

	if (error instanceof Error && error.message === "Unauthorized") {
		return createErrorResponse(401, "Unauthorized.");
	}

	console.error("Unexpected file API error", error);
	return createErrorResponse(500, "Unexpected server error.");
}

async function insertFileRecord(input: {
	storageKey: string;
	originalName: string;
	contentType: string;
	sizeBytes: number;
	userId: string;
}) {
	const [record] = await db
		.insert(files)
		.values({
			id: crypto.randomUUID(),
			storage_key: input.storageKey,
			original_name: input.originalName,
			content_type: input.contentType,
			size_bytes: input.sizeBytes,
			user_id: input.userId,
		})
		.returning();

	if (!record) {
		throw new FileStorageError("Unable to save file metadata.", 500);
	}

	return record;
}

async function findFileRecord(fileId: string) {
	const [record] = await db.select().from(files).where(eq(files.id, fileId)).limit(1);

	return record;
}

async function openStoredFile(storageKey: string) {
	const file = Bun.file(resolveStoragePath(storageKey));

	if (!(await file.exists())) {
		return null;
	}

	return file;
}

function parseFileId(fileId: string) {
	if (!uuidPattern.test(fileId)) {
		throw new TypeError("Invalid file id.");
	}

	return fileId;
}

function parseByteRange(
	rangeHeader: string | null,
	fileSize: number,
): ByteRange | null {
	if (!rangeHeader) {
		return null;
	}

	if (!rangeHeader.startsWith("bytes=") || rangeHeader.includes(",")) {
		return "invalid";
	}

	const [startPart = "", endPart = ""] = rangeHeader.slice(6).split("-", 2);

	if (startPart === "" && endPart === "") {
		return "invalid";
	}

	if (startPart === "") {
		const suffixLength = Number.parseInt(endPart, 10);

		if (!Number.isInteger(suffixLength) || suffixLength <= 0) {
			return "invalid";
		}

		return {
			start: Math.max(fileSize - suffixLength, 0),
			end: fileSize - 1,
		};
	}

	const start = Number.parseInt(startPart, 10);

	if (!Number.isInteger(start) || start < 0 || start >= fileSize) {
		return "invalid";
	}

	if (endPart === "") {
		return {
			start,
			end: fileSize - 1,
		};
	}

	const end = Number.parseInt(endPart, 10);

	if (!Number.isInteger(end) || end < start) {
		return "invalid";
	}

	return {
		start,
		end: Math.min(end, fileSize - 1),
	};
}

export async function handleFileUploadRequest(request: Request) {
	try {
		const session = await requireSessionFromHeaders(new Headers(request.headers));
		const formData = await request.formData();
		const uploadedFile = formData.get("file");

		if (!(uploadedFile instanceof File)) {
			return createErrorResponse(400, "Please choose a file to upload.");
		}

		const savedFile = await saveUploadedFileToDisk(uploadedFile);

		try {
			const record = await insertFileRecord({
				storageKey: savedFile.storageKey,
				originalName: savedFile.originalName,
				contentType: savedFile.contentType,
				sizeBytes: savedFile.sizeBytes,
				userId: session.user.id,
			});

			return Response.json({ file: record }, { status: 201 });
		} catch (error) {
			await deleteStoredFile(savedFile.storageKey, {
				ignoreMissing: true,
			});
			throw error;
		}
	} catch (error) {
		return toErrorResponse(error);
	}
}

export async function handleFileServeRequest(request: Request, fileId: string) {
	try {
		await requireSessionFromHeaders(new Headers(request.headers));
		const parsedFileId = parseFileId(fileId);
		const record = await findFileRecord(parsedFileId);

		if (!record) {
			return createErrorResponse(404, "File not found.");
		}

		const fileBody = await openStoredFile(record.storage_key);

		if (!fileBody) {
			return createErrorResponse(404, "Stored file not found.");
		}

		const requestUrl = new URL(request.url);
		const download = requestUrl.searchParams.get("download") === "1";
		const range = parseByteRange(request.headers.get("range"), fileBody.size);

		if (range === "invalid") {
			const headers = new Headers();
			headers.set("Accept-Ranges", "bytes");
			headers.set("Content-Range", `bytes */${fileBody.size}`);

			return new Response(null, {
				status: 416,
				headers,
			});
		}

		const responseBody = range
			? fileBody.slice(range.start, range.end + 1, record.content_type)
			: fileBody;
		const responseHeaders = buildFileResponseHeaders(
			{
				...record,
				size_bytes: responseBody.size,
			},
			{ download },
		);
		responseHeaders.set("Accept-Ranges", "bytes");

		if (range) {
			responseHeaders.set(
				"Content-Range",
				`bytes ${range.start}-${range.end}/${fileBody.size}`,
			);
		}

		return new Response(request.method === "HEAD" ? null : responseBody, {
			status: range ? 206 : 200,
			headers: responseHeaders,
		});
	} catch (error) {
		return toErrorResponse(error);
	}
}

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
