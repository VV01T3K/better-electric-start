export const themeStorageKey = "theme";
export const appThemes = ["light", "dark", "system"] as const;
export const defaultTheme = "system" as const;

export type AppTheme = (typeof appThemes)[number];
export type ResolvedAppTheme = Exclude<AppTheme, "system">;

export function isAppTheme(theme: string | undefined): theme is AppTheme {
	return appThemes.includes(theme as AppTheme);
}

export function isResolvedAppTheme(
	theme: string | undefined,
): theme is ResolvedAppTheme {
	return theme === "light" || theme === "dark";
}
