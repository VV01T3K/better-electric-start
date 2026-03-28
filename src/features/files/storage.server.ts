import "@tanstack/react-start/server-only";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import {
	MAX_FILE_SIZE_BYTES,
	allowedUploadContentTypes,
	isInlineContentType,
} from "./shared";

type StoredFileLike = {
	original_name: string;
	content_type: string;
	size_bytes: number;
};

type SaveUploadedFileResult = {
	storageKey: string;
	originalName: string;
	contentType: string;
	sizeBytes: number;
};

export class FileStorageError extends Error {
	readonly status: 400 | 404 | 500;

	constructor(message: string, status: 400 | 404 | 500) {
		super(message);
		this.name = "FileStorageError";
		this.status = status;
	}
}

const fallbackContentTypesByExtension: Record<string, string> = {
	".avif": "image/avif",
	".gif": "image/gif",
	".jpeg": "image/jpeg",
	".jpg": "image/jpeg",
	".pdf": "application/pdf",
	".png": "image/png",
	".svg": "image/svg+xml",
	".txt": "text/plain",
	".webp": "image/webp",
	".zip": "application/zip",
};

export function getUploadsRootDir(rootDir = path.resolve("data/uploads")) {
	return rootDir;
}

export function sanitizeFileName(fileName: string) {
	const withoutControlCharacters = Array.from(fileName)
		.filter((character) => {
			const codePoint = character.codePointAt(0) ?? 0;
			return !(codePoint <= 0x1f || codePoint === 0x7f);
		})
		.join("");

	const sanitized = withoutControlCharacters
		.replaceAll(/[\\/:"*?<>|]+/g, " ")
		.replaceAll(/\s+/g, " ")
		.trim();

	return sanitized || "file";
}

export function validateUploadSize(sizeBytes: number) {
	if (!Number.isInteger(sizeBytes) || sizeBytes <= 0) {
		throw new FileStorageError("Please choose a non-empty file.", 400);
	}

	if (sizeBytes > MAX_FILE_SIZE_BYTES) {
		throw new FileStorageError(
			`Files must be ${Math.round(MAX_FILE_SIZE_BYTES / 1024 / 1024)} MB or smaller.`,
			400,
		);
	}
}

export function normalizeUploadContentType(options: {
	fileName: string;
	contentType: string;
}) {
	const normalizedContentType = options.contentType.toLowerCase();

	if (allowedUploadContentTypes.has(normalizedContentType)) {
		return normalizedContentType;
	}

	const extension = path.extname(options.fileName).toLowerCase();
	const fallbackContentType = fallbackContentTypesByExtension[extension];

	if (fallbackContentType) {
		return fallbackContentType;
	}

	throw new FileStorageError(
		"Only images, PDFs, plain text files, and zip archives are allowed.",
		400,
	);
}

export function createStorageKey(fileName: string, now = new Date()) {
	const extension = path.extname(sanitizeFileName(fileName)).toLowerCase();
	const datePrefix = now.toISOString().slice(0, 10);
	return `${datePrefix}/${crypto.randomUUID()}${extension}`;
}

export function resolveStoragePath(
	storageKey: string,
	rootDir = getUploadsRootDir(),
) {
	const resolvedRootDir = path.resolve(rootDir);
	const resolvedStoragePath = path.resolve(resolvedRootDir, storageKey);

	if (
		resolvedStoragePath !== resolvedRootDir &&
		!resolvedStoragePath.startsWith(`${resolvedRootDir}${path.sep}`)
	) {
		throw new FileStorageError("Invalid storage path.", 400);
	}

	return resolvedStoragePath;
}

export async function ensureUploadsRootDir(rootDir = getUploadsRootDir()) {
	await mkdir(rootDir, { recursive: true });
	return rootDir;
}

export async function saveUploadedFileToDisk(
	file: File,
	options?: {
		rootDir?: string;
		now?: Date;
	},
): Promise<SaveUploadedFileResult> {
	const originalName = sanitizeFileName(file.name);
	const contentType = normalizeUploadContentType({
		fileName: originalName,
		contentType: file.type,
	});

	validateUploadSize(file.size);

	const rootDir = await ensureUploadsRootDir(options?.rootDir);
	const storageKey = createStorageKey(originalName, options?.now);
	const storagePath = resolveStoragePath(storageKey, rootDir);
	const storageFile = Bun.file(storagePath);

	await mkdir(path.dirname(storagePath), { recursive: true });
	await Bun.write(storageFile, file);

	return {
		storageKey,
		originalName,
		contentType,
		sizeBytes: file.size,
	};
}

export async function deleteStoredFile(
	storageKey: string,
	options?: {
		rootDir?: string;
		ignoreMissing?: boolean;
	},
) {
	const storagePath = resolveStoragePath(storageKey, options?.rootDir);
	const storageFile = Bun.file(storagePath);

	try {
		await storageFile.delete();
	} catch (error) {
		const code = (error as NodeJS.ErrnoException).code;

		if (code === "ENOENT" && options?.ignoreMissing) {
			return;
		}

		throw error;
	}
}

function getAsciiFallbackFileName(fileName: string) {
	return sanitizeFileName(fileName)
		.replaceAll(/[^\x20-\x7e]/g, "_")
		.replaceAll(/["\\]/g, "_");
}

function encodeFileNameForContentDisposition(fileName: string) {
	return encodeURIComponent(fileName).replaceAll(
		/[!'()*]/g,
		(character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
	);
}

export function buildContentDisposition(
	fileName: string,
	options?: {
		download?: boolean;
		inlineAllowed?: boolean;
	},
) {
	const dispositionType =
		options?.download || !options?.inlineAllowed ? "attachment" : "inline";
	const asciiFallback = getAsciiFallbackFileName(fileName);
	const encodedFileName = encodeFileNameForContentDisposition(fileName);

	return `${dispositionType}; filename="${asciiFallback}"; filename*=UTF-8''${encodedFileName}`;
}

export function buildFileResponseHeaders(
	file: StoredFileLike,
	options?: {
		download?: boolean;
	},
) {
	const headers = new Headers();
	headers.set("Content-Length", String(file.size_bytes));
	headers.set("Content-Type", file.content_type);
	headers.set(
		"Content-Disposition",
		buildContentDisposition(file.original_name, {
			download: options?.download,
			inlineAllowed: isInlineContentType(file.content_type),
		}),
	);
	headers.set("X-Content-Type-Options", "nosniff");

	return headers;
}
