import { createFileRoute } from "@tanstack/react-router";

import { handleFileUploadRequest } from "#/features/files/api.server";

export const Route = createFileRoute("/api/files")({
	server: {
		handlers: {
			POST: ({ request }) => handleFileUploadRequest(request),
		},
	},
});
