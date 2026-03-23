import { z } from 'zod'

const simpleListItem = z.object({
  id: z.uuid().brand<'simple_list_items'>(),
  label: z.string().trim().min(1, 'List item text is required.'),
  createdAt: z.date(),
})

export type SimpleListItem = z.input<typeof simpleListItem>

export const simpleListItemServerSchema = {
  row: simpleListItem,
  insert: simpleListItem,
  update: simpleListItem
    .omit({ createdAt: true })
    .partial()
    .required({ id: true }),
  delete: simpleListItem.pick({ id: true }),
}

export const simpleListItemClientSchema = {
  id: simpleListItem.shape.id,
  add: simpleListItem.pick({ label: true }),
}
