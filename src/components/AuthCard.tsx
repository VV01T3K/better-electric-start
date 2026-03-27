import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

import { Card, CardContent, CardFooter } from "#/components/ui/card";

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
		<main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-5 py-12">
			<div className="animate-fade-up w-full max-w-sm">
				<div className="mb-8 flex flex-col items-center text-center">
					<div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary">
						<Zap className="size-5 text-primary-foreground" />
					</div>
					<h1 className="text-xl font-bold tracking-tight">{title}</h1>
					<p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
						{description}
					</p>
				</div>

				<Card>
					<CardContent className="pt-4">{children}</CardContent>

					<CardFooter className="justify-center border-t border-border/50 pt-4">
						<p className="text-xs text-muted-foreground">
							{footerText}{" "}
							<Link
								to={footerHref}
								className="font-medium text-foreground no-underline hover:text-primary"
							>
								{footerLabel}
							</Link>
						</p>
					</CardFooter>
				</Card>
			</div>
		</main>
	);
}
