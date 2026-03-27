import { Moon, Sun, Monitor } from "lucide-react";
import { type MouseEvent, useEffect, useState } from "react";

import type { AppTheme } from "#/components/theme-switch/themeSettings";
import { useCircleThemeTransition } from "#/components/theme-switch/useCircleThemeTransition";
import { useTheme } from "#/components/ThemeProvider";
import { Button } from "#/components/ui/button";

function getNextTheme(theme: AppTheme): AppTheme {
	return theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
}

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
	const resolvedThemeLabel = mounted ? (resolvedTheme ?? "light") : "light";

	function toggleMode(event: MouseEvent<HTMLButtonElement>) {
		if (!mounted) {
			return;
		}

		const nextTheme = getNextTheme(selectedTheme);

		void animateThemeChange(event.currentTarget, () => {
			setTheme(nextTheme);
		});
	}

	const Icon = icons[selectedTheme];
	const nextThemeLabel = getNextTheme(selectedTheme);
	const label =
		selectedTheme === "system"
			? `Theme: system (${resolvedThemeLabel}). Click for ${nextThemeLabel}.`
			: `Theme: ${selectedTheme}. Click for ${nextThemeLabel}.`;

	return (
		<Button
			variant="ghost"
			size="icon-sm"
			onClick={toggleMode}
			aria-label={label}
			title={label}
		>
			<Icon className="size-3.5" />
		</Button>
	);
}
