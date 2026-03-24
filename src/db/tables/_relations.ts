import '@tanstack/react-start/server-only'

import { relations as authRelations } from './auth.gen'
import { todoRelations } from './todos'

export const relations = {
  ...authRelations,
  ...todoRelations,
  users: {
    ...authRelations.users,
    relations: {
      ...authRelations.users.relations,
      ...todoRelations.users.relations,
    },
  },
} satisfies typeof authRelations & typeof todoRelations & {
  users: typeof authRelations.users & typeof todoRelations.users
}
