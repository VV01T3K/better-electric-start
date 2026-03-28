import { createMiddleware } from "@tanstack/react-start";

import { requireCurrentSession } from "#/integrations/better-auth/session.server";

export const requireSessionMiddleware = createMiddleware({
	type: "function",
}).server(async ({ next }) => {
	const session = await requireCurrentSession();

	return next({
		context: {
			session,
		},
	});
});
