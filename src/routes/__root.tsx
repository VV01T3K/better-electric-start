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
				title: "TanStack Start Starter",
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
		<html lang="en">
			<head>
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
		<>
			<Header />
			<Outlet />
			<Footer />
		</>
	);
}
