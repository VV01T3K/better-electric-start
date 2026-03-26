import { Link } from "@tanstack/react-router";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";

type AuthCardProps = {
	title: string;
	description: string;
	footerText: string;
	footerHref: string;
	footerLabel: string;
	children: React.ReactNode;
};

export default function AuthCard({
	title,
	description,
	footerText,
	footerHref,
	footerLabel,
	children,
}: AuthCardProps) {
	return (
		<main className="mx-auto max-w-5xl px-4 py-12">
			<Card className="mx-auto max-w-md">
				<CardHeader>
					<p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
						Better Auth
					</p>
					<CardTitle className="text-2xl font-bold">{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>

				<CardContent>{children}</CardContent>

				<CardFooter>
					<p className="text-sm text-muted-foreground">
						{footerText}{" "}
						<Link
							to={footerHref}
							className="font-medium text-primary no-underline"
						>
							{footerLabel}
						</Link>
					</p>
				</CardFooter>
			</Card>
		</main>
	);
}
