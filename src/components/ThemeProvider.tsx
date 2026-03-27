import {
	ThemeProvider as NextThemesProvider,
	type ThemeProviderProps,
	type UseThemeProps,
	useTheme as useNextTheme,
} from "next-themes";

import {
	defaultTheme,
	isAppTheme,
	isResolvedAppTheme,
	themeStorageKey,
	type AppTheme,
	type ResolvedAppTheme,
} from "./theme-switch/themeSettings";

type AppThemeContext = Omit<
	UseThemeProps,
	"resolvedTheme" | "setTheme" | "theme"
> & {
	resolvedTheme?: ResolvedAppTheme;
	setTheme: (theme: AppTheme) => void;
	theme?: AppTheme;
};

export function ThemeProvider(props: ThemeProviderProps) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme={defaultTheme}
			disableTransitionOnChange
			enableSystem
			storageKey={themeStorageKey}
			{...props}
		/>
	);
}

export function useTheme(): AppThemeContext {
	const ctx = useNextTheme();
	const appTheme = isAppTheme(ctx.theme) ? ctx.theme : undefined;
	const resolvedTheme = isResolvedAppTheme(ctx.resolvedTheme)
		? ctx.resolvedTheme
		: undefined;

	return {
		...ctx,
		resolvedTheme,
		setTheme: (nextTheme: AppTheme) => ctx.setTheme(nextTheme),
		theme: appTheme,
	};
}
