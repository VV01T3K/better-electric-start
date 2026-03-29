import { createFileRoute } from "@tanstack/react-router";

import { handleFileServeRequest } from "#/features/files/api.server";

export const Route = createFileRoute("/api/files/$id")({
	server: {
		handlers: {
			GET: ({ request, params }) =>
				handleFileServeRequest(request, params.id),
			HEAD: ({ request, params }) =>
				handleFileServeRequest(request, params.id),
		},
	},
});
