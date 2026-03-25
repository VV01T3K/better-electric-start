import { drizzle } from "drizzle-orm/node-postgres";
import { ENV } from "varlock/env";

import { relations } from "./tables/_relations";
import * as schema from "./tables/_schema";

export const db = drizzle(ENV.DATABASE_URL, { schema, relations });
