export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
export const FILE_UPLOAD_PATH = "/api/files/" as const;
export const FILE_ROUTE_PATTERN = "/api/files/$id" as const;

export const ALLOWED_UPLOAD_CONTENT_TYPES = [
	"application/pdf",
	"application/x-zip-compressed",
	"application/zip",
	"image/avif",
	"image/gif",
	"image/jpeg",
	"image/png",
	"image/svg+xml",
	"image/webp",
	"text/plain",
] as const;

export const UPLOAD_ACCEPT_ATTRIBUTE = ALLOWED_UPLOAD_CONTENT_TYPES.join(",");

export const allowedUploadContentTypes = new Set<string>(
	ALLOWED_UPLOAD_CONTENT_TYPES,
);

export function getFilePath(id: string) {
	return `/api/files/${id}`;
}

export function formatFileSize(sizeBytes: number) {
	if (!Number.isFinite(sizeBytes) || sizeBytes < 0) {
		return "0 B";
	}

	const units = ["B", "KB", "MB", "GB"] as const;
	let value = sizeBytes;
	let unitIndex = 0;

	while (value >= 1024 && unitIndex < units.length - 1) {
		value /= 1024;
		unitIndex += 1;
	}

	const digits = value >= 100 || unitIndex === 0 ? 0 : 1;

	return `${value.toFixed(digits)} ${units[unitIndex]}`;
}

export function isImageContentType(contentType: string) {
	return contentType.startsWith("image/");
}

export function isInlineContentType(contentType: string) {
	return (
		isImageContentType(contentType) ||
		contentType === "application/pdf" ||
		contentType.startsWith("text/")
	);
}
