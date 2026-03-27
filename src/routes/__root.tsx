import type { QueryClient } from "@tanstack/react-query";
import {
	HeadContent,
	Link,
	Outlet,
	Scripts,
	createRootRouteWithContext,
	useLocation,
} from "@tanstack/react-router";
import React from "react";

import { AppSidebar } from "../components/app-sidebar";
import { DashedGridBackground } from "../components/dashed-grid-background";
import { ThemeProvider } from "../components/ThemeProvider";
import ThemeToggle from "../components/ThemeToggle";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { Separator } from "../components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "../components/ui/sidebar";
import { TooltipProvider } from "../components/ui/tooltip";
import { getSession } from "../integrations/better-auth/functions";
import GlobalNavigationHotkeys from "../integrations/tanstack/hotkeys/GlobalNavigationHotkeys";
import TanStackQueryProvider from "../integrations/tanstack/query/root-provider";
import { getBreadcrumbItems } from "../lib/navigation";

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
				<HeadContent />
			</head>
			<body className="font-sans antialiased">
				<ThemeProvider>
					<TanStackQueryProvider>
						<TooltipProvider>{children}</TooltipProvider>
					</TanStackQueryProvider>
				</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}

function DynamicBreadcrumbs() {
	const { pathname } = useLocation();
	const items = getBreadcrumbItems(pathname);

	if (items.length === 1) {
		return (
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbPage>{items[0]?.label}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
		);
	}

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{items.map((item, index) => {
					const isLast = index === items.length - 1;

					return (
						<React.Fragment key={`${item.label}-${index}`}>
							{index > 0 && (
								<BreadcrumbSeparator className="hidden md:block" />
							)}
							<BreadcrumbItem
								className={!isLast ? "hidden md:block" : ""}
							>
								{item.to && !isLast ? (
									<BreadcrumbLink render={<Link to={item.to} />}>
										{item.label}
									</BreadcrumbLink>
								) : (
									<BreadcrumbPage>{item.label}</BreadcrumbPage>
								)}
							</BreadcrumbItem>
						</React.Fragment>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}

function RootLayout() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<DashedGridBackground className="flex flex-1 flex-col">
					<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
						<div className="flex items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1" />
							<Separator
								orientation="vertical"
								className="mr-2 data-vertical:h-4!"
							/>
							<DynamicBreadcrumbs />
						</div>
						<div className="ml-auto flex items-center gap-2 px-4">
							<ThemeToggle />
						</div>
					</header>
					<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
						<Outlet />
					</div>
				</DashedGridBackground>
			</SidebarInset>
			<GlobalNavigationHotkeys />
		</SidebarProvider>
	);
}
