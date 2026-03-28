// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = {
	db: {
		insert: vi.fn(),
		select: vi.fn(),
		transaction: vi.fn(),
	},
	requireSessionFromHeaders: vi.fn(),
	saveUploadedFileToDisk: vi.fn(),
	deleteStoredFile: vi.fn(),
	resolveStoragePath: vi.fn(),
	readTxId: vi.fn(),
	createServerFn: vi.fn(() => {
		const chain = {
			middleware: vi.fn(() => chain),
			inputValidator: vi.fn(() => chain),
			handler: vi.fn((impl) => {
				const serverFn = vi.fn((input) => impl(input ?? {})) as ReturnType<
					typeof vi.fn
				> & {
					method: string;
					__executeServer: (input?: unknown) => unknown;
				};
				serverFn.method = "MOCK";
				serverFn.__executeServer = (input?: unknown) => impl(input ?? {});
				return serverFn;
			}),
		};

		return chain;
	}),
};

vi.mock("@tanstack/react-start", () => ({
	createServerFn: mocks.createServerFn,
}));

vi.mock("#/db", () => ({
	db: mocks.db,
}));

vi.mock("#/integrations/better-auth/session.server", () => ({
	requireSessionFromHeaders: mocks.requireSessionFromHeaders,
}));

vi.mock("#/integrations/better-auth/middleware", () => ({
	requireSessionMiddleware: Symbol("requireSessionMiddleware"),
}));

vi.mock("#/integrations/electric/read-tx-id", () => ({
	readTxId: mocks.readTxId,
}));

const storageServer = await import("./storage.server");
const actualSaveUploadedFileToDisk = storageServer.saveUploadedFileToDisk;
const actualDeleteStoredFile = storageServer.deleteStoredFile;
const actualResolveStoragePath = storageServer.resolveStoragePath;
const saveUploadedFileToDiskSpy = vi.spyOn(
	storageServer,
	"saveUploadedFileToDisk",
);
const deleteStoredFileSpy = vi.spyOn(storageServer, "deleteStoredFile");
const resolveStoragePathSpy = vi.spyOn(storageServer, "resolveStoragePath");
const actualBunFile = Bun.file.bind(Bun);
const bunFileSpy = vi.spyOn(Bun, "file");

const {
	deleteFile,
	getFileCount,
	handleFileServeRequest,
	handleFileUploadRequest,
} = await import("./api.server");
const { FileStorageError } = storageServer;

function mockInsertReturning(result: unknown) {
	mocks.db.insert.mockReturnValue({
		values: vi.fn().mockReturnValue({
			returning: vi.fn().mockResolvedValue(result),
		}),
	});
}

function mockSelectLimit(result: unknown) {
	mocks.db.select.mockReturnValue({
		from: vi.fn().mockReturnValue({
			where: vi.fn().mockReturnValue({
				limit: vi.fn().mockResolvedValue(result),
			}),
		}),
	});
}

function mockSelectFrom(result: unknown) {
	mocks.db.select.mockReturnValue({
		from: vi.fn().mockResolvedValue(result),
	});
}

function createStoredBlob(
	content: string,
	options?: {
		exists?: boolean;
	},
) {
	const blob = new Blob([content]);
	const file = Object.assign(blob, {
		exists: vi.fn().mockResolvedValue(options?.exists ?? true),
	});

	return file;
}

beforeEach(() => {
	vi.clearAllMocks();
	mocks.readTxId.mockResolvedValue(42);
	saveUploadedFileToDiskSpy.mockImplementation(actualSaveUploadedFileToDisk);
	deleteStoredFileSpy.mockImplementation(actualDeleteStoredFile);
	resolveStoragePathSpy.mockImplementation(actualResolveStoragePath);
	bunFileSpy.mockImplementation(actualBunFile as typeof Bun.file);
});

describe("file API handlers", () => {
	it("rejects unauthenticated uploads", async () => {
		const formData = new FormData();
		formData.append(
			"file",
			new File(["hello"], "hello.txt", { type: "text/plain" }),
		);
		mocks.requireSessionFromHeaders.mockRejectedValue(
			new Error("Unauthorized"),
		);

		const response = await handleFileUploadRequest(
			new Request("http://localhost/api/files", {
				method: "POST",
				body: formData,
			}),
		);

		expect(response.status).toBe(401);
		await expect(response.json()).resolves.toEqual({
			error: "Unauthorized.",
		});
	});

	it("creates metadata for a successful upload", async () => {
		const formData = new FormData();
		formData.append(
			"file",
			new File(["hello"], "hello.txt", { type: "text/plain" }),
		);
		mocks.requireSessionFromHeaders.mockResolvedValue({
			user: {
				id: "39542ca0-df72-4a23-b733-8b409dc9dc38",
			},
		});
		saveUploadedFileToDiskSpy.mockResolvedValue({
			storageKey: "2026-03-27/file.txt",
			originalName: "hello.txt",
			contentType: "text/plain",
			sizeBytes: 5,
		});
		mockInsertReturning([
			{
				id: "8a7506f2-7fc5-4ae3-b4e1-5630552c74b8",
				storage_key: "2026-03-27/file.txt",
				original_name: "hello.txt",
				content_type: "text/plain",
				size_bytes: 5,
				user_id: "39542ca0-df72-4a23-b733-8b409dc9dc38",
				created_at: new Date("2026-03-27T12:00:00.000Z"),
				updated_at: new Date("2026-03-27T12:00:00.000Z"),
			},
		]);

		const response = await handleFileUploadRequest(
			new Request("http://localhost/api/files", {
				method: "POST",
				body: formData,
			}),
		);

		expect(response.status).toBe(201);
		expect(saveUploadedFileToDiskSpy).toHaveBeenCalledTimes(1);
		await expect(response.json()).resolves.toMatchObject({
			file: {
				id: "8a7506f2-7fc5-4ae3-b4e1-5630552c74b8",
				original_name: "hello.txt",
			},
		});
	});

	it("cleans up the stored blob when metadata creation fails", async () => {
		const formData = new FormData();
		formData.append(
			"file",
			new File(["hello"], "hello.txt", { type: "text/plain" }),
		);
		mocks.requireSessionFromHeaders.mockResolvedValue({
			user: {
				id: "39542ca0-df72-4a23-b733-8b409dc9dc38",
			},
		});
		saveUploadedFileToDiskSpy.mockResolvedValue({
			storageKey: "2026-03-27/file.txt",
			originalName: "hello.txt",
			contentType: "text/plain",
			sizeBytes: 5,
		});
		mockInsertReturning([]);

		const response = await handleFileUploadRequest(
			new Request("http://localhost/api/files", {
				method: "POST",
				body: formData,
			}),
		);

		expect(response.status).toBe(500);
		expect(deleteStoredFileSpy).toHaveBeenCalledWith(
			"2026-03-27/file.txt",
			{
				ignoreMissing: true,
			},
		);
		await expect(response.json()).resolves.toEqual({
			error: "Unable to save file metadata.",
		});
	});

	it("rejects unauthenticated file serving", async () => {
		mocks.requireSessionFromHeaders.mockRejectedValue(
			new Error("Unauthorized"),
		);

		const response = await handleFileServeRequest(
			new Request("http://localhost/api/files/test"),
			"6a8f8eb8-4c33-47fb-a1d8-a1b2d57ab41c",
		);

		expect(response.status).toBe(401);
		await expect(response.json()).resolves.toEqual({
			error: "Unauthorized.",
		});
	});

	it("serves stored files with inline headers", async () => {
		mocks.requireSessionFromHeaders.mockResolvedValue({
			user: {
				id: "39542ca0-df72-4a23-b733-8b409dc9dc38",
			},
		});
		mockSelectLimit([
			{
				id: "6a8f8eb8-4c33-47fb-a1d8-a1b2d57ab41c",
				storage_key: "2026-03-27/report.pdf",
				original_name: "report.pdf",
				content_type: "application/pdf",
				size_bytes: 11,
				user_id: "39542ca0-df72-4a23-b733-8b409dc9dc38",
				created_at: new Date("2026-03-27T12:00:00.000Z"),
				updated_at: new Date("2026-03-27T12:00:00.000Z"),
			},
		]);
		const storedFile = createStoredBlob("hello world");
		bunFileSpy.mockReturnValue(storedFile as unknown as Bun.BunFile);

		const response = await handleFileServeRequest(
			new Request("http://localhost/api/files/test"),
			"6a8f8eb8-4c33-47fb-a1d8-a1b2d57ab41c",
		);

		expect(response.status).toBe(200);
		expect(response.headers.get("Accept-Ranges")).toBe("bytes");
		expect(response.headers.get("Content-Type")).toBe("application/pdf");
		expect(response.headers.get("Content-Disposition")).toContain("inline;");
		await expect(response.text()).resolves.toBe("hello world");
	});

	it("serves stored files with download headers", async () => {
		mocks.requireSessionFromHeaders.mockResolvedValue({
			user: {
				id: "39542ca0-df72-4a23-b733-8b409dc9dc38",
			},
		});
		mockSelectLimit([
			{
				id: "6a8f8eb8-4c33-47fb-a1d8-a1b2d57ab41c",
				storage_key: "2026-03-27/report.pdf",
				original_name: "report.pdf",
				content_type: "application/pdf",
				size_bytes: 11,
				user_id: "39542ca0-df72-4a23-b733-8b409dc9dc38",
				created_at: new Date("2026-03-27T12:00:00.000Z"),
				updated_at: new Date("2026-03-27T12:00:00.000Z"),
			},
		]);
		const storedFile = createStoredBlob("hello world");
		bunFileSpy.mockReturnValue(storedFile as unknown as Bun.BunFile);

		const response = await handleFileServeRequest(
			new Request("http://localhost/api/files/test?download=1"),
			"6a8f8eb8-4c33-47fb-a1d8-a1b2d57ab41c",
		);

		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Disposition")).toContain(
			"attachment;",
		);
		await expect(response.text()).resolves.toBe("hello world");
	});

	it("serves partial file responses for byte ranges", async () => {
		mocks.requireSessionFromHeaders.mockResolvedValue({
			user: {
				id: "39542ca0-df72-4a23-b733-8b409dc9dc38",
			},
		});
		mockSelectLimit([
			{
				id: "6a8f8eb8-4c33-47fb-a1d8-a1b2d57ab41c",
				storage_key: "2026-03-27/report.pdf",
				original_name: "report.pdf",
				content_type: "application/pdf",
				size_bytes: 11,
				user_id: "39542ca0-df72-4a23-b733-8b409dc9dc38",
				created_at: new Date("2026-03-27T12:00:00.000Z"),
				updated_at: new Date("2026-03-27T12:00:00.000Z"),
			},
		]);
		const storedFile = createStoredBlob("hello world");
		bunFileSpy.mockReturnValue(storedFile as unknown as Bun.BunFile);

		const response = await handleFileServeRequest(
			new Request("http://localhost/api/files/test", {
				headers: {
					Range: "bytes=0-4",
				},
			}),
			"6a8f8eb8-4c33-47fb-a1d8-a1b2d57ab41c",
		);

		expect(response.status).toBe(206);
		expect(response.headers.get("Accept-Ranges")).toBe("bytes");
		expect(response.headers.get("Content-Range")).toBe("bytes 0-4/11");
		expect(response.headers.get("Content-Length")).toBe("5");
		await expect(response.text()).resolves.toBe("hello");
	});

	it("rejects invalid byte ranges", async () => {
		mocks.requireSessionFromHeaders.mockResolvedValue({
			user: {
				id: "39542ca0-df72-4a23-b733-8b409dc9dc38",
			},
		});
		mockSelectLimit([
			{
				id: "6a8f8eb8-4c33-47fb-a1d8-a1b2d57ab41c",
				storage_key: "2026-03-27/report.pdf",
				original_name: "report.pdf",
				content_type: "application/pdf",
				size_bytes: 11,
				user_id: "39542ca0-df72-4a23-b733-8b409dc9dc38",
				created_at: new Date("2026-03-27T12:00:00.000Z"),
				updated_at: new Date("2026-03-27T12:00:00.000Z"),
			},
		]);
		const storedFile = createStoredBlob("hello world");
		bunFileSpy.mockReturnValue(storedFile as unknown as Bun.BunFile);

		const response = await handleFileServeRequest(
			new Request("http://localhost/api/files/test", {
				headers: {
					Range: "bytes=50-60",
				},
			}),
			"6a8f8eb8-4c33-47fb-a1d8-a1b2d57ab41c",
		);

		expect(response.status).toBe(416);
		expect(response.headers.get("Accept-Ranges")).toBe("bytes");
		expect(response.headers.get("Content-Range")).toBe("bytes */11");
		await expect(response.text()).resolves.toBe("");
	});

	it("returns headers without the body for HEAD requests", async () => {
		mocks.requireSessionFromHeaders.mockResolvedValue({
			user: {
				id: "39542ca0-df72-4a23-b733-8b409dc9dc38",
			},
		});
		mockSelectLimit([
			{
				id: "6a8f8eb8-4c33-47fb-a1d8-a1b2d57ab41c",
				storage_key: "2026-03-27/report.pdf",
				original_name: "report.pdf",
				content_type: "application/pdf",
				size_bytes: 11,
				user_id: "39542ca0-df72-4a23-b733-8b409dc9dc38",
				created_at: new Date("2026-03-27T12:00:00.000Z"),
				updated_at: new Date("2026-03-27T12:00:00.000Z"),
			},
		]);
		const storedFile = createStoredBlob("hello world");
		bunFileSpy.mockReturnValue(storedFile as unknown as Bun.BunFile);

		const response = await handleFileServeRequest(
			new Request("http://localhost/api/files/test", {
				method: "HEAD",
			}),
			"6a8f8eb8-4c33-47fb-a1d8-a1b2d57ab41c",
		);

		expect(response.status).toBe(200);
		expect(response.headers.get("Accept-Ranges")).toBe("bytes");
		expect(response.headers.get("Content-Length")).toBe("11");
		await expect(response.text()).resolves.toBe("");
	});
});

describe("file server functions", () => {
	it("removes the metadata record and stored blob", async () => {
		const tx = {
			select: vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([
							{
								id: "f9dcb4ba-7449-47c9-8ce2-dbb6cd1fcf46",
								storage_key: "2026-03-27/hello.txt",
							},
						]),
					}),
				}),
			}),
			delete: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue(undefined),
			}),
		};
		mocks.db.transaction.mockImplementation(async (callback) => callback(tx));

		const result = await (deleteFile as any).__executeServer({
			data: {
				id: "f9dcb4ba-7449-47c9-8ce2-dbb6cd1fcf46",
			},
			method: "POST",
		});

		expect(deleteStoredFileSpy).toHaveBeenCalledWith(
			"2026-03-27/hello.txt",
			{
				ignoreMissing: true,
			},
		);
		expect(result).toEqual({ txid: 42 });
	});

	it("returns the shared authenticated file count", async () => {
		mockSelectFrom([{ count: 3 }]);

		await expect(
			(getFileCount as any).__executeServer({
				method: "GET",
				data: undefined,
			}),
		).resolves.toBe(3);
	});

	it("throws a not found error when deleting a missing file", async () => {
		const tx = {
			select: vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([]),
					}),
				}),
			}),
			delete: vi.fn(),
		};
		mocks.db.transaction.mockImplementation(async (callback) => callback(tx));

		await expect(
			(deleteFile as any).__executeServer({
				data: {
					id: "f9dcb4ba-7449-47c9-8ce2-dbb6cd1fcf46",
				},
				method: "POST",
			}),
		).rejects.toBeInstanceOf(FileStorageError);
	});
});
