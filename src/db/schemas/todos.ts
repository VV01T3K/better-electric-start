import { z } from 'zod'

const todo = z.object({
  id: z.uuid().default(() => crypto.randomUUID()),
  text: z.string().trim().min(1, 'Todo text is required.'),
  completed: z.boolean().default(false),
  user_id: z.uuid().default('00000000-0000-0000-0000-000000000000'),
  created_at: z.coerce.date().default(() => new Date()),
})

export type Todo = z.infer<typeof todo>

export const todoServerSchema = {
  row: todo,
  insert: todo.omit({ user_id: true }),
  update: todo
    .omit({ created_at: true, user_id: true })
    .partial()
    .required({ id: true }),
  delete: todo.pick({ id: true }),
}

export const todoSchema = {
  id: todo.shape.id,
  add: todo.pick({ text: true }),
}
