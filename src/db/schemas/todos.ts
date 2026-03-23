import { z } from 'zod'

const todo = z.object({
  id: z.uuid().default(() => crypto.randomUUID()),
  text: z.string().trim().min(1, 'Todo text is required.'),
  completed: z.boolean().default(false),
  created_at: z.coerce.date().default(() => new Date()),
})

export type Todo = z.input<typeof todo>

export const todoServerSchema = {
  row: todo,
  insert: todo,
  update: todo
    .omit({ created_at: true })
    .partial()
    .required({ id: true }),
  delete: todo.pick({ id: true }),
}

export const todoSchema = {
  id: todo.shape.id,
  add: todo.pick({ text: true }),
}
