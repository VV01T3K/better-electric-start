import { createFileRoute } from "@tanstack/react-router";

import { handleFileServeRequest } from "#/features/files/api.server";

export const Route = createFileRoute("/api/files/$fileId")({
	server: {
		handlers: {
			GET: ({ request, params }) =>
				handleFileServeRequest(request, params.fileId),
			HEAD: ({ request, params }) =>
				handleFileServeRequest(request, params.fileId),
		},
	},
});
