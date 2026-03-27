export const themeStorageKey = "theme";
export const appThemes = ["light", "dark", "system"] as const;
export const defaultTheme = "system" as const;

export type AppTheme = (typeof appThemes)[number];
export type ResolvedAppTheme = Exclude<AppTheme, "system">;

type ThemeOptionDetails = {
	description: string;
	label: string;
};

export const themeOptionDetails = {
	light: {
		description: "Always use the light theme.",
		label: "Light",
	},
	dark: {
		description: "Always use the dark theme.",
		label: "Dark",
	},
	system: {
		description: "Follow your device appearance.",
		label: "Auto",
	},
} satisfies Record<AppTheme, ThemeOptionDetails>;

export const themeOptions = appThemes.map((value) => ({
	value,
	...themeOptionDetails[value],
}));

export function isAppTheme(theme: string | undefined): theme is AppTheme {
	return appThemes.includes(theme as AppTheme);
}

export function isResolvedAppTheme(
	theme: string | undefined,
): theme is ResolvedAppTheme {
	return theme === "light" || theme === "dark";
}

export function getQuickToggleTheme(
	theme: AppTheme,
	resolvedTheme: ResolvedAppTheme = "light",
): ResolvedAppTheme {
	if (theme === "light") {
		return "dark";
	}

	if (theme === "dark") {
		return "light";
	}

	return resolvedTheme === "dark" ? "light" : "dark";
}
