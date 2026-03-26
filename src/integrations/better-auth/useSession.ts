import { useRouteContext } from "@tanstack/react-router";

import { authClient } from "#/integrations/better-auth/client";

export function useSession() {
	const { session: serverSession } = useRouteContext({ from: "__root__" });
	const clientSession = authClient.useSession();

	// Use the server-known session during hydration to avoid auth-state flicker.
	const session = clientSession.isPending ? serverSession : clientSession.data;
	const user = session?.user ?? null;

	return {
		...clientSession,
		data: session,
		user,
		isAuthenticated: Boolean(user),
		isPending: serverSession === undefined ? clientSession.isPending : false,
	};
}
