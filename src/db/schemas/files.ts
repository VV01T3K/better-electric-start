import { z } from "zod";

import { MAX_FILE_SIZE_BYTES } from "#/features/files/shared";

const file = z.object({
	id: z
		.uuid()
		.default(() => crypto.randomUUID())
		.brand<"files">(),
	user_id: z.uuid().brand<"users">(),
	storage_key: z.string().trim().min(1).max(512),
	original_name: z.string().trim().min(1).max(255),
	content_type: z.string().trim().min(1).max(127),
	size_bytes: z.int().nonnegative().max(MAX_FILE_SIZE_BYTES),
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
