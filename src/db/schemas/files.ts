import { z } from "zod";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export const ALLOWED_UPLOAD_CONTENT_TYPES = [
	"application/pdf",
	"application/zip",
	"image/avif",
	"image/gif",
	"image/jpeg",
	"image/png",
	"image/webp",
	"text/plain",
] as const;

// const icons = (string: string): LucideIcon => {
// 	switch (string) {
// 		case "application/pdf":
// 			return Archive;
// 		case "text/plain":
// 			return FileText;
// 		default:
// 			return FileText;
// 	}
// };

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
		"Unsupported file type. Allowed types: " +
			ALLOWED_UPLOAD_CONTENT_TYPES.map(
				(type) => type.split("/").slice(-1)[0],
			).join(", "),
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
