// @vitest-environment node

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
	buildFileResponseHeaders,
	createStorageKey,
	deleteStoredFile,
	normalizeUploadContentType,
	resolveStoragePath,
	sanitizeFileName,
	saveUploadedFileToDisk,
} from "./storage.server";

describe("file storage helpers", () => {
	it("sanitizes filenames without dropping useful text", () => {
		expect(sanitizeFileName(' quarterly/report<>:"final".pdf ')).toBe(
			"quarterly report final .pdf",
		);
	});

	it("creates dated storage keys that preserve the extension", () => {
		const storageKey = createStorageKey(
			"diagram.png",
			new Date("2026-03-27T12:00:00.000Z"),
		);

		expect(storageKey).toMatch(/^2026-03-27\/.+\.png$/);
	});

	it("rejects path traversal when resolving storage paths", () => {
		expect(() =>
			resolveStoragePath("../escape.txt", "/tmp/demo-uploads"),
		).toThrow("Invalid storage path.");
	});

	it("falls back to the file extension when the browser omits a MIME type", () => {
		expect(
			normalizeUploadContentType({
				fileName: "notes.txt",
				contentType: "",
			}),
		).toBe("text/plain");
	});

	it("builds inline and download response headers", () => {
		const inlineHeaders = buildFileResponseHeaders({
			original_name: "photo.png",
			content_type: "image/png",
			size_bytes: 128,
		});
		const downloadHeaders = buildFileResponseHeaders(
			{
				original_name: "archive.zip",
				content_type: "application/zip",
				size_bytes: 512,
			},
			{ download: true },
		);

		expect(inlineHeaders.get("Content-Disposition")).toContain("inline;");
		expect(inlineHeaders.get("Content-Type")).toBe("image/png");
		expect(downloadHeaders.get("Content-Disposition")).toContain(
			"attachment;",
		);
		expect(downloadHeaders.get("Content-Length")).toBe("512");
	});

	it("saves and deletes uploaded files using the storage helpers", async () => {
		const rootDir = await mkdtemp(path.join(tmpdir(), "files-storage-"));

		try {
			const savedFile = await saveUploadedFileToDisk(
				new File(["hello world"], "notes.txt", {
					type: "text/plain",
				}),
				{
					rootDir,
					now: new Date("2026-03-27T12:00:00.000Z"),
				},
			);
			const storagePath = resolveStoragePath(savedFile.storageKey, rootDir);

			await expect(Bun.file(storagePath).text()).resolves.toBe(
				"hello world",
			);

			await deleteStoredFile(savedFile.storageKey, {
				rootDir,
			});

			await expect(Bun.file(storagePath).exists()).resolves.toBe(false);
		} finally {
			await rm(rootDir, { recursive: true, force: true });
		}
	});
});
