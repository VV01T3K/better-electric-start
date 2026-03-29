import { Archive, FileImage, FileText, type LucideIcon } from "lucide-react";
import { z } from "zod";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export const ALLOWED_UPLOAD_CONTENT_TYPE_MAP = {
	"application/pdf": {
		name: "pdf",
		icon: FileText,
	},
	"application/x-zip-compressed": {
		name: "zip",
		icon: Archive,
	},
	"application/zip": {
		name: "zip",
		icon: Archive,
	},
	"image/avif": {
		name: "avif",
		icon: FileImage,
	},
	"image/gif": {
		name: "gif",
		icon: FileImage,
	},
	"image/jpeg": {
		name: "jpg",
		icon: FileImage,
	},
	"image/png": {
		name: "png",
		icon: FileImage,
	},
	"image/svg+xml": {
		name: "svg",
		icon: FileImage,
	},
	"image/webp": {
		name: "webp",
		icon: FileImage,
	},
	"text/plain": {
		name: "txt",
		icon: FileText,
	},
} as const satisfies Record<
	string,
	{
		name: string;
		icon: LucideIcon;
	}
>;

export const ALLOWED_UPLOAD_CONTENT_TYPES = Object.keys(
	ALLOWED_UPLOAD_CONTENT_TYPE_MAP,
) as [
	keyof typeof ALLOWED_UPLOAD_CONTENT_TYPE_MAP,
	...(keyof typeof ALLOWED_UPLOAD_CONTENT_TYPE_MAP)[],
];

const file = z.object({
	id: z
		.uuid()
		.default(() => crypto.randomUUID())
		.brand<"files">(),
	user_id: z.uuid().brand<"users">(),
	storage_key: z.string().trim().min(1).max(512),
	original_name: z
		.string()
		.trim()
		.min(1, "File name is required.")
		.max(255, "File name must be 255 characters or less."),
	content_type: z.enum(
		ALLOWED_UPLOAD_CONTENT_TYPES,
		"Invalid content type. Allowed types are: " +
			ALLOWED_UPLOAD_CONTENT_TYPES.join(", "),
	),
	size_bytes: z.int().min(1).max(MAX_FILE_SIZE_BYTES),
	created_at: z.coerce.date().default(() => new Date()),
	updated_at: z.coerce.date().default(() => new Date()),
});

export type StoredFile = z.output<typeof file>;

export const fileServerSchema = {
	row: file,
	insert: file,
	update: file
		.omit({ created_at: true, user_id: true })
		.partial()
		.required({ id: true }),
	delete: file.pick({ id: true }),
};

export const fileSchema = {
	id: file.shape.id,
};
