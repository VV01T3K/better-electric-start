import { ChevronDown, Moon, Sun, Monitor } from "lucide-react";
import { type MouseEvent, useEffect, useState } from "react";

import {
	getQuickToggleTheme,
	themeOptionDetails,
	themeOptions,
	type AppTheme,
	type ResolvedAppTheme,
} from "#/components/theme-switch/themeSettings";
import { useCircleThemeTransition } from "#/components/theme-switch/useCircleThemeTransition";
import { useTheme } from "#/components/ThemeProvider";
import { Button, buttonVariants } from "#/components/ui/button";
import { ButtonGroup } from "#/components/ui/button-group";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { cn } from "#/lib/utils";

const icons = {
	light: Sun,
	dark: Moon,
	system: Monitor,
} as const;

export default function ThemeToggle() {
	const [mounted, setMounted] = useState(false);
	const animateThemeChange = useCircleThemeTransition();
	const { resolvedTheme, theme, setTheme } = useTheme();

	useEffect(() => {
		setMounted(true);
	}, []);

	const selectedTheme = mounted && theme ? theme : "system";
	const activeResolvedTheme = mounted ? (resolvedTheme ?? "light") : "light";
	const quickToggleTheme = getQuickToggleTheme(
		selectedTheme,
		activeResolvedTheme,
	);
	const displayTheme: AppTheme | ResolvedAppTheme =
		selectedTheme === "system" ? activeResolvedTheme : selectedTheme;
	const DisplayIcon = icons[displayTheme];

	function toggleMode(event: MouseEvent<HTMLButtonElement>) {
		if (!mounted) {
			return;
		}

		void animateThemeChange(event.currentTarget, () => {
			setTheme(quickToggleTheme);
		});
	}

	function handleThemeSelect(
		nextTheme: AppTheme,
		trigger: HTMLElement | null,
	) {
		if (!mounted || nextTheme === selectedTheme) {
			return;
		}

		void animateThemeChange(trigger, () => {
			setTheme(nextTheme);
		});
	}

	const quickToggleLabel =
		selectedTheme === "system"
			? `Theme: auto (${themeOptionDetails[activeResolvedTheme].label.toLowerCase()} right now). Click to switch to ${themeOptionDetails[quickToggleTheme].label.toLowerCase()}.`
			: `Theme: ${themeOptionDetails[selectedTheme].label.toLowerCase()}. Click to switch to ${themeOptionDetails[quickToggleTheme].label.toLowerCase()}.`;
	const menuLabel = `Theme options. Current theme: ${themeOptionDetails[selectedTheme].label.toLowerCase()}.`;

	return (
		<DropdownMenu modal={false}>
			<ButtonGroup className="relative rounded-lg bg-popover/70 ring-1 ring-foreground/10 before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:rounded-[inherit] before:backdrop-blur-2xl before:backdrop-saturate-150">
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={toggleMode}
					aria-label={quickToggleLabel}
					title={quickToggleLabel}
				>
					<span className="relative">
						<DisplayIcon className="size-3.5" />
						{selectedTheme === "system" ? (
							<Monitor className="absolute right-[-0.3rem] bottom-[-0.3rem] size-2.75 rounded-full bg-background p-0.5 text-muted-foreground" />
						) : null}
					</span>
				</Button>
				<DropdownMenuTrigger
					className={cn(
						buttonVariants({
							size: "icon-sm",
							variant: "ghost",
						}),
						"w-6 px-0",
					)}
					aria-label={menuLabel}
					title={menuLabel}
					openOnHover
					delay={100}
					closeDelay={150}
				>
					<ChevronDown className="size-3" />
				</DropdownMenuTrigger>
			</ButtonGroup>
			<DropdownMenuContent align="end" className="min-w-52">
				<DropdownMenuGroup>
					<DropdownMenuLabel>
						Theme
						{selectedTheme === "system"
							? ` · Auto (${themeOptionDetails[activeResolvedTheme].label})`
							: ` · ${themeOptionDetails[selectedTheme].label}`}
					</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuRadioGroup value={selectedTheme}>
					{themeOptions.map((option) => {
						const OptionIcon = icons[option.value];

						return (
							<DropdownMenuRadioItem
								key={option.value}
								value={option.value}
								closeOnClick
								label={option.label}
								className="min-w-0 items-start gap-2 py-2"
								onClick={(event) =>
									handleThemeSelect(
										option.value,
										event.currentTarget as HTMLElement,
									)
								}
							>
								<OptionIcon className="mt-0.5" />
								<span className="flex min-w-0 flex-col">
									<span className="font-medium">{option.label}</span>
									<span className="text-[0.6875rem] text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground/70">
										{option.description}
									</span>
								</span>
							</DropdownMenuRadioItem>
						);
					})}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
