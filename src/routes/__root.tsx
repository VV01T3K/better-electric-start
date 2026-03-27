import type { QueryClient } from "@tanstack/react-query";
import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { getSession } from "../integrations/better-auth/functions";
import GlobalNavigationHotkeys from "../integrations/tanstack/hotkeys/GlobalNavigationHotkeys";
import TanStackQueryProvider from "../integrations/tanstack/query/root-provider";

import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	beforeLoad: async () => {
		return {
			session: await getSession(),
		};
	},
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Electric Start",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	component: RootLayout,
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches);document.documentElement.classList.add(d?"dark":"light");document.documentElement.style.colorScheme=d?"dark":"light";if(t&&t!=="auto")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
					}}
				/>
				<HeadContent />
			</head>
			<body className="font-sans antialiased">
				<TanStackQueryProvider>{children}</TanStackQueryProvider>
				<Scripts />
			</body>
		</html>
	);
}

function RootLayout() {
	return (
		<div className="flex min-h-screen flex-col">
			<GlobalNavigationHotkeys />
			<Header />
			<div className="flex-1">
				<Outlet />
			</div>
			<Footer />
		</div>
	);
}
