import { z } from "zod";

const todo = z.object({
	id: z
		.uuid()
		.default(() => crypto.randomUUID())
		.brand<"todos">(),
	user_id: z.uuid().brand<"users">(),
	created_at: z.coerce.date().default(() => new Date()),
	updated_at: z.coerce.date().default(() => new Date()),
	completed: z.boolean().default(false),
	text: z
		.string()
		.trim()
		.min(1, "Todo text is required.")
		.max(54, "Todo text must be 54 characters or less."),
});

export type Todo = z.output<typeof todo>;
export const todoServerSchema = {
	row: todo,
	insert: todo.omit({ user_id: true }),
	update: todo
		.omit({ created_at: true, user_id: true })
		.partial()
		.required({ id: true }),
	delete: todo.pick({ id: true }),
};

export const todoSchema = {
	id: todo.shape.id,
	add: todo.pick({ text: true }),
};
