import { z } from 'zod'

const simpleListItem = z.object({
  id: z.uuid().default(() => crypto.randomUUID()).brand<'simple_list_items'>(),
  label: z.string().trim().min(1, 'List item text is required.'),
  created_at: z.coerce.date().default(() => new Date()),
})

export const simpleListItemServerSchema = {
  row: simpleListItem,
  insert: simpleListItem,
  update: simpleListItem
    .omit({ created_at: true })
    .partial()
    .required({ id: true }),
  delete: simpleListItem.pick({ id: true }),
}

export const simpleListItemClientSchema = {
  id: simpleListItem.shape.id,
  add: simpleListItem.pick({ label: true }),
}
