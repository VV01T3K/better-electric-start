import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button, buttonVariants } from "#/components/ui/button";
import { authClient } from "#/integrations/better-auth/client";
import { useSession } from "#/integrations/better-auth/useSession";
import { cn } from "#/lib/utils";

import ThemeToggle from "./ThemeToggle";

export default function Header() {
	const navigate = useNavigate();
	const { data: session, isPending } = useSession();
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
				<Link
					to="/"
					className="text-sm font-semibold text-foreground no-underline"
				>
					Home
				</Link>
				{session?.user ? (
					<>
						<Link
							to="/demo/db/todos"
							className="text-sm text-muted-foreground no-underline hover:text-foreground"
						>
							Todos
						</Link>
						<Link
							to="/demo/db/simple-list"
							className="text-sm text-muted-foreground no-underline hover:text-foreground"
						>
							Simple List
						</Link>
					</>
				) : null}
				<div className="ml-auto flex items-center gap-3">
					<ThemeToggle />
					{session?.user ? (
						<>
							<span className="hidden text-sm text-muted-foreground sm:inline">
								{session.user.email}
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
