import "@tanstack/react-start/server-only";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth/minimal";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { ENV } from "varlock/env";

import { db } from "#/db";
import * as schema from "#/db/tables/_schema";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		schema,
		provider: "pg",
		transaction: true,
		camelCase: false,
		usePlural: true,
	}),
	advanced: {
		database: {
			generateId: "uuid",
		},
	},
	experimental: {
		joins: true,
	},
	baseURL: ENV.BETTER_AUTH_URL,
	trustedOrigins: [ENV.BETTER_AUTH_URL, ENV.CADDY_PROXY_URL],
	secret: ENV.BETTER_AUTH_SECRET,
	emailAndPassword: {
		enabled: true,
	},
	rateLimit: {
		enabled: false,
	},
	plugins: [tanstackStartCookies()],
});
