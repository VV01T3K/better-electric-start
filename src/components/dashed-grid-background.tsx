import type * as React from "react";

import { cn } from "#/lib/utils";

const dashedGridStyle = {
	"--grid-color": "color-mix(in oklab, var(--border) 78%, transparent)",
	backgroundImage: `
		linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
		linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)
	`,
	backgroundSize: "20px 20px",
	maskImage: `
		repeating-linear-gradient(
			to right,
			black 0px,
			black 3px,
			transparent 3px,
			transparent 8px
		),
		repeating-linear-gradient(
			to bottom,
			black 0px,
			black 3px,
			transparent 3px,
			transparent 8px
		)
	`,
	WebkitMaskImage: `
		repeating-linear-gradient(
			to right,
			black 0px,
			black 3px,
			transparent 3px,
			transparent 8px
		),
		repeating-linear-gradient(
			to bottom,
			black 0px,
			black 3px,
			transparent 3px,
			transparent 8px
		)
	`,
	maskComposite: "intersect",
	WebkitMaskComposite: "source-in",
} as React.CSSProperties;

export function DashedGridBackground({
	children,
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("relative isolate w-full bg-background", className)}
			{...props}
		>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 z-0 opacity-80"
				style={dashedGridStyle}
			/>
			<div className="relative z-10 flex min-h-0 flex-1 flex-col">
				{children}
			</div>
		</div>
	);
}
