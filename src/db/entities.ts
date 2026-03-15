import { z } from 'zod'

const uuidSchema = z.uuid()

export const todoRowSchema = z.object({
  id: uuidSchema,
  text: z.string().trim().min(1, 'Todo text is required.'),
  completed: z.boolean(),
  created_at: z.date(),
})

export type TodoRow = z.infer<typeof todoRowSchema>

export const simpleListItemRowSchema = z.object({
  id: uuidSchema,
  label: z.string().trim().min(1, 'List item text is required.'),
  created_at: z.date(),
})

export type SimpleListItemRow = z.infer<typeof simpleListItemRowSchema>
