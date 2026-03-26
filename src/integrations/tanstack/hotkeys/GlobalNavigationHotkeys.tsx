import { getHotkeyManager } from "@tanstack/react-hotkeys";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { navLinks } from "#/components/Header";
import { useSession } from "#/integrations/better-auth/useSession";

const authPagePathnames = new Set(["/auth/sign-in", "/auth/sign-up"]);
const hotkeyOptions = {
	ignoreInputs: true,
	requireReset: true,
};

export default function GlobalNavigationHotkeys() {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { isAuthenticated } = useSession();

	useEffect(() => {
		const hotkeyManager = getHotkeyManager();
		const registrations =
			!isAuthenticated && authPagePathnames.has(pathname)
				? []
				: navLinks
						.filter((link) => isAuthenticated || link.public)
						.map((link) =>
							hotkeyManager.register(
								link.hotkey,
								() => {
									void navigate({ to: link.to });
								},
								hotkeyOptions,
							),
						);

		return () => {
			registrations.forEach((registration) => registration.unregister());
		};
	}, [isAuthenticated, navigate, pathname]);

	return null;
}
