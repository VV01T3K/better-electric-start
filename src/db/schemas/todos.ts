import { z } from 'zod'

const todo = z.object({
  id: z.uuid().brand<'todos'>(),
  text: z.string().trim().min(1, 'Todo text is required.'),
  completed: z.boolean(),
  created_at: z.date(),
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
