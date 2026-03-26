import { Link, createFileRoute } from "@tanstack/react-router";

import { buttonVariants } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { useSession } from "#/integrations/better-auth/useSession";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const { isAuthenticated, isPending, user } = useSession();

	return (
		<main className="mx-auto max-w-5xl px-4 py-12">
			<Card className="mx-auto max-w-3xl">
				<CardHeader>
					<p className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
						Better Auth + Electric SQL
					</p>
					<CardTitle className="text-3xl font-bold">
						Sync private todos and shared lists behind a real session
						boundary.
					</CardTitle>
					<CardDescription className="max-w-2xl">
						This starter now uses Better Auth for email/password sessions,
						TanStack Router for route protection, and Electric SQL with
						TanStack DB for live synced data.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<div className="flex flex-wrap gap-3">
						{isAuthenticated ? (
							<>
								<Link
									to="/demo/db/todos"
									className={cn(
										buttonVariants({ variant: "default" }),
										"rounded-full no-underline",
									)}
								>
									Open my todos
								</Link>
								<Link
									to="/demo/db/simple-list"
									className={cn(
										buttonVariants({ variant: "outline" }),
										"rounded-full no-underline",
									)}
								>
									Open shared list
								</Link>
							</>
						) : (
							<>
								<Link
									to="/auth/sign-up"
									className={cn(
										buttonVariants({ variant: "default" }),
										"rounded-full no-underline",
									)}
								>
									Create account
								</Link>
								<Link
									to="/auth/sign-in"
									className={cn(
										buttonVariants({ variant: "outline" }),
										"rounded-full no-underline",
									)}
								>
									Sign in
								</Link>
							</>
						)}
					</div>
				</CardContent>

				<CardFooter>
					<p className="text-sm text-muted-foreground">
						{isPending
							? "Checking your session..."
							: isAuthenticated
								? `Signed in as ${user?.email}.`
								: "Sign in to access the synced demo routes."}
					</p>
				</CardFooter>
			</Card>
		</main>
	);
}
