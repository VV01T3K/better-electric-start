import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { useState } from "react";

import { Button, buttonVariants } from "#/components/ui/button";
import { Separator } from "#/components/ui/separator";
import { authClient } from "#/integrations/better-auth/client";
import { useSession } from "#/integrations/better-auth/useSession";
import { getVisibleNavLinks } from "#/lib/navigation";
import { cn } from "#/lib/utils";

import ThemeToggle from "./ThemeToggle";

export default function Header() {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { isAuthenticated, isPending, user } = useSession();
	const [isSigningOut, setIsSigningOut] = useState(false);
	const visibleNavLinks = getVisibleNavLinks(isAuthenticated);

	async function handleSignOut() {
		setIsSigningOut(true);

		const { error } = await authClient.signOut();

		setIsSigningOut(false);

		if (!error) {
			await navigate({ to: "/auth/sign-in" });
		}
	}

	return (
		<header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
			<nav className="mx-auto flex max-w-5xl items-center gap-1 px-5 py-2.5">
				<Link
					to="/"
					className="mr-3 flex items-center gap-2 no-underline transition-opacity hover:opacity-70"
				>
					<div className="flex size-7 items-center justify-center rounded-lg bg-primary">
						<Zap className="size-3.5 text-primary-foreground" />
					</div>
					<span className="hidden text-sm font-semibold tracking-tight text-foreground sm:inline">
						Electric Start
					</span>
				</Link>

				<Separator orientation="vertical" className="mx-2! h-4!" />

				<div className="flex items-center gap-0.5">
					{visibleNavLinks.map((link) => {
						const isActive = pathname === link.to;

						return (
							<Link
								key={link.to}
								to={link.to}
								title={`${link.label} (${link.hotkey})`}
								className={cn(
									"relative inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium no-underline transition-all",
									isActive
										? "bg-accent text-foreground"
										: "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
								)}
							>
								<link.icon className="size-3.5" />
								<span>{link.label}</span>
								{isActive && (
									<span className="absolute -bottom-3.25 left-1/2 h-px w-6 -translate-x-1/2 bg-primary" />
								)}
							</Link>
						);
					})}
				</div>

				<div className="ml-auto flex items-center gap-2">
					<ThemeToggle />

					{isAuthenticated ? (
						<>
							<span className="hidden max-w-45 truncate text-xs text-muted-foreground sm:inline">
								{user?.email}
							</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() => void handleSignOut()}
								disabled={isSigningOut}
							>
								{isSigningOut ? "..." : "Sign out"}
							</Button>
						</>
					) : (
						<>
							<Link
								to="/auth/sign-in"
								className={cn(
									buttonVariants({ variant: "ghost", size: "sm" }),
									"no-underline",
								)}
							>
								Sign in
							</Link>
							<Link
								to="/auth/sign-up"
								className={cn(
									buttonVariants({ variant: "default", size: "sm" }),
									"no-underline",
								)}
							>
								{isPending ? "..." : "Get started"}
							</Link>
						</>
					)}
				</div>
			</nav>
		</header>
	);
}
