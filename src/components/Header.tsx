import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, ListTodo, ClipboardList } from "lucide-react";
import { useState } from "react";

import { Button, buttonVariants } from "#/components/ui/button";
import { authClient } from "#/integrations/better-auth/client";
import { useSession } from "#/integrations/better-auth/useSession";
import type { NavLinkArray } from "#/integrations/tanstack/hotkeys/nav-links.ts";
import { cn } from "#/lib/utils";

import ThemeToggle from "./ThemeToggle";

export const navLinks: NavLinkArray = [
	{
		to: "/",
		label: "Home",
		icon: Home,
		hotkey: "1",
		public: true,
	},
	{
		to: "/demo/db/todos",
		label: "Todos",
		icon: ListTodo,
		hotkey: "2",
	},
	{
		to: "/demo/db/simple-list",
		label: "Simple List",
		icon: ClipboardList,
		hotkey: "3",
	},
] as const;

export default function Header() {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { isAuthenticated, isPending, user } = useSession();
	const [isSigningOut, setIsSigningOut] = useState(false);

	async function handleSignOut() {
		setIsSigningOut(true);

		const { error } = await authClient.signOut();

		setIsSigningOut(false);

		if (!error) {
			await navigate({ to: "/auth/sign-in" });
		}
	}

	return (
		<header className="border-b border-border px-4">
			<nav className="mx-auto flex max-w-5xl items-center gap-4 py-3">
				{navLinks
					.filter((link) => isAuthenticated || link.public)
					.map((link) => {
						const isActive = pathname === link.to;

						return (
							<Link
								key={link.to}
								to={link.to}
								title={`${link.label} (${link.hotkey})`}
								className={cn(
									"inline-flex items-center gap-1.5 text-sm no-underline transition-colors",
									isActive
										? "font-semibold text-foreground"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								<link.icon className="size-4" />
								<span>{link.label}</span>
							</Link>
						);
					})}
				<div className="ml-auto flex items-center gap-3">
					<ThemeToggle />
					{isAuthenticated ? (
						<>
							<span className="hidden text-sm text-muted-foreground sm:inline">
								{user?.email}
							</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() => void handleSignOut()}
								disabled={isSigningOut}
								className="rounded-full"
							>
								{isSigningOut ? "Signing out..." : "Sign out"}
							</Button>
						</>
					) : (
						<>
							<Link
								to="/auth/sign-in"
								className="text-sm text-muted-foreground no-underline hover:text-foreground"
							>
								Sign in
							</Link>
							<Link
								to="/auth/sign-up"
								className={cn(
									buttonVariants({ variant: "default", size: "sm" }),
									"rounded-full no-underline",
								)}
							>
								{isPending ? "..." : "Sign up"}
							</Link>
						</>
					)}
				</div>
			</nav>
		</header>
	);
}
