import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Database, Lock, Zap } from "lucide-react";

import { buttonVariants } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";
import { useSession } from "#/integrations/better-auth/useSession";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/")({ component: App });

const features = [
	{
		icon: Lock,
		title: "Session-based auth",
		description:
			"Email & password authentication with Better Auth, protected routes via TanStack Router guards.",
	},
	{
		icon: Database,
		title: "Live sync",
		description:
			"Electric SQL streams changes to TanStack DB collections. Data updates appear instantly across clients.",
	},
	{
		icon: Zap,
		title: "Local-first forms",
		description:
			"TanStack Form handles validation client-side. Writes go through optimistic collections with persistence tracking.",
	},
] as const;

function App() {
	const { isAuthenticated, isPending, user } = useSession();

	return (
		<main className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
			{/* Hero */}
			<div className="animate-fade-up max-w-2xl">
				<p className="font-mono text-[11px] tracking-widest text-primary uppercase">
					Better Auth + Electric SQL
				</p>

				<h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
					Sync private todos and shared lists behind a real session
					boundary.
				</h1>

				<p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
					This starter uses Better Auth for email &amp; password sessions,
					TanStack Router for route protection, and Electric SQL with
					TanStack DB for live synced data.
				</p>

				<div className="mt-8 flex flex-wrap items-center gap-3">
					{isAuthenticated ? (
						<>
							<Link
								to="/demo/db/todos"
								className={cn(
									buttonVariants({ variant: "default", size: "lg" }),
									"gap-2 no-underline",
								)}
							>
								Open my todos
								<ArrowRight className="size-3.5" />
							</Link>
							<Link
								to="/demo/db/simple-list"
								className={cn(
									buttonVariants({ variant: "outline", size: "lg" }),
									"no-underline",
								)}
							>
								Shared list
							</Link>
						</>
					) : (
						<>
							<Link
								to="/auth/sign-up"
								className={cn(
									buttonVariants({ variant: "default", size: "lg" }),
									"gap-2 no-underline",
								)}
							>
								Get started
								<ArrowRight className="size-3.5" />
							</Link>
							<Link
								to="/auth/sign-in"
								className={cn(
									buttonVariants({ variant: "outline", size: "lg" }),
									"no-underline",
								)}
							>
								Sign in
							</Link>
						</>
					)}
				</div>

				<div className="mt-6">
					<p className="text-xs text-muted-foreground">
						{isPending
							? "Checking session..."
							: isAuthenticated
								? `Signed in as ${user?.email}`
								: "Sign in to access the synced demo routes."}
					</p>
				</div>
			</div>

			{/* Features */}
			<Separator className="my-16" />

			<div className="grid gap-4 sm:grid-cols-3">
				{features.map((feature, i) => (
					<Card
						key={feature.title}
						className={cn(
							"animate-fade-up border-border/50 bg-card/50",
							i === 0 && "stagger-1",
							i === 1 && "stagger-2",
							i === 2 && "stagger-3",
						)}
					>
						<CardHeader>
							<div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-accent">
								<feature.icon className="size-4 text-foreground/70" />
							</div>
							<CardTitle className="text-sm font-semibold">
								{feature.title}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription className="text-xs leading-relaxed">
								{feature.description}
							</CardDescription>
						</CardContent>
					</Card>
				))}
			</div>
		</main>
	);
}
