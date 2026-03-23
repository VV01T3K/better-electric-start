import { drizzle } from 'drizzle-orm/node-postgres'
import { ENV } from 'varlock/env'

import * as schema from './schema'

export const db = drizzle(ENV.DATABASE_URL, { schema })
