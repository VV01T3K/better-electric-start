import { Separator } from "#/components/ui/separator";

export default function Footer() {
	return (
		<footer className="px-5 pt-16 pb-8">
			<div className="mx-auto max-w-5xl">
				<Separator className="mb-6" />
				<div className="flex items-center justify-between">
					<p className="text-xs text-muted-foreground">
						Built with{" "}
						<span className="font-medium text-foreground/60">
							TanStack Start
						</span>
					</p>
					<p className="font-mono text-[10px] tracking-wider text-muted-foreground/50 uppercase">
						Local-first sync
					</p>
				</div>
			</div>
		</footer>
	);
}
