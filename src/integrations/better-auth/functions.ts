import { createServerFn } from "@tanstack/react-start";

import { requireSessionMiddleware } from "#/integrations/better-auth/middleware";
import { getCurrentSession } from "#/integrations/better-auth/session.server";

export const getSession = createServerFn({ method: "GET" }).handler(
	async () => {
		return getCurrentSession();
	},
);

export const requireSession = createServerFn({ method: "GET" })
	.middleware([requireSessionMiddleware])
	.handler(async ({ context }) => {
		return context.session;
	});
