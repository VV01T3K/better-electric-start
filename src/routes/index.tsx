import { Link, createFileRoute } from "@tanstack/react-router";

import { useSession } from "#/integrations/better-auth/useSession";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const { data: session, isPending } = useSession();
	const isSignedIn = Boolean(session?.user);

	return (
		<main className="page-wrap px-4 py-12">
			<section className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-(--line) bg-white/70 p-8 shadow-sm">
				<div className="space-y-3">
					<p className="text-sm tracking-[0.24em] text-(--sea-ink-soft) uppercase">
						Better Auth + Electric SQL
					</p>
					<h1 className="text-3xl font-bold text-(--sea-ink)">
						Sync private todos and shared lists behind a real session
						boundary.
					</h1>
					<p className="max-w-2xl text-(--sea-ink-soft)">
						This starter now uses Better Auth for email/password sessions,
						TanStack Router for route protection, and Electric SQL with
						TanStack DB for live synced data.
					</p>
				</div>

				<div className="flex flex-wrap gap-3">
					{isSignedIn ? (
						<>
							<Link
								to="/demo/db/todos"
								className="rounded-full bg-(--lagoon-deep) px-4 py-2 text-sm font-medium text-white no-underline"
							>
								Open my todos
							</Link>
							<Link
								to="/demo/db/simple-list"
								className="rounded-full border border-(--line) px-4 py-2 text-sm font-medium text-(--sea-ink) no-underline"
							>
								Open shared list
							</Link>
						</>
					) : (
						<>
							<Link
								to="/auth/sign-up"
								className="rounded-full bg-(--lagoon-deep) px-4 py-2 text-sm font-medium text-white no-underline"
							>
								Create account
							</Link>
							<Link
								to="/auth/sign-in"
								className="rounded-full border border-(--line) px-4 py-2 text-sm font-medium text-(--sea-ink) no-underline"
							>
								Sign in
							</Link>
						</>
					)}
				</div>

				<p className="text-sm text-(--sea-ink-soft)">
					{isPending
						? "Checking your session..."
						: isSignedIn
							? `Signed in as ${session?.user.email}.`
							: "Sign in to access the synced demo routes."}
				</p>
			</section>
		</main>
	);
}
