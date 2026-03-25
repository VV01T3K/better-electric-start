import "@tanstack/react-start/server-only";
import { createMiddleware } from "@tanstack/react-start";

import { getSessionFromHeaders } from "#/integrations/better-auth/session.server";

import { authorizeElectricShapeRequest } from "./shapes";

type ElectricRouteParams = {
	shape?: string;
};

export const electricProxyMiddleware = createMiddleware().server(
	async (options) => {
		const authorizationResult = await authorizeElectricShapeRequest({
			shapeName: (
				options as typeof options & {
					params?: ElectricRouteParams;
				}
			).params?.shape,
			getSession: () => getSessionFromHeaders(options.request.headers),
		});

		if (authorizationResult instanceof Response) {
			return authorizationResult;
		}

		return options.next({
			context: {
				electricProxy: authorizationResult,
			},
		});
	},
);
