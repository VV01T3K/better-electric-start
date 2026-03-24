import '@tanstack/react-start/server-only'

import { defineRelationsPart } from 'drizzle-orm'

import * as schema from './schema'
import { relations as authRelations } from './tables/auth.gen'

const appRelations = defineRelationsPart(schema, (r) => ({
  users: {
    todos: r.many.todos({
      from: r.users.id,
      to: r.todos.user_id,
    }),
  },
  todos: {
    user: r.one.users({
      from: r.todos.user_id,
      to: r.users.id,
    }),
  },
}))

const userRelations = {
  ...authRelations.users,
  relations: {
    ...authRelations.users.relations,
    ...appRelations.users.relations,
  },
}

export const relations = {
  ...authRelations,
  ...appRelations,
  users: userRelations,
  todos: appRelations.todos,
} satisfies typeof authRelations & typeof appRelations & {
  users: typeof userRelations
}
