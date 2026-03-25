import { createFileRoute } from "@tanstack/react-router";
import { ENV } from "varlock/env";

import { createElectricProxyHandler } from "#/integrations/electric/proxy/handler";
import { electricProxyMiddleware } from "#/integrations/electric/proxy/middleware";

const handleElectricProxyRequest = createElectricProxyHandler({
	electricUrl: ENV.ELECTRIC_URL,
	sourceId: ENV.ELECTRIC_SOURCE_ID,
	secret: ENV.ELECTRIC_SECRET,
});

export const Route = createFileRoute("/api/electric/$shape")({
	server: {
		middleware: [electricProxyMiddleware],
		handlers: {
			GET: ({ request, context }) =>
				handleElectricProxyRequest(request, context.electricProxy),
		},
	},
});
