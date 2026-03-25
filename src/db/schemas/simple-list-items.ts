import { z } from "zod";

const simpleListItem = z.object({
	id: z
		.uuid()
		.default(() => crypto.randomUUID())
		.brand<"simple_list_items">(),
	created_at: z.coerce.date().default(() => new Date()),
	updated_at: z.coerce.date().default(() => new Date()),
	label: z
		.string()
		.trim()
		.min(1, "List item text is required.")
		.max(61, "List item text must be 61 characters or less."),
});

export const simpleListItemServerSchema = {
	row: simpleListItem,
	insert: simpleListItem,
	update: simpleListItem
		.omit({ created_at: true })
		.partial()
		.required({ id: true }),
	delete: simpleListItem.pick({ id: true }),
};

export const simpleListItemClientSchema = {
	id: simpleListItem.shape.id,
	add: simpleListItem.pick({ label: true }),
};
