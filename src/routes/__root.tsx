import type { QueryClient } from "@tanstack/react-query";
import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
	useLocation,
} from "@tanstack/react-router";
import React from "react";

import { AppSidebar } from "../components/app-sidebar";
import ThemeToggle from "../components/ThemeToggle";
import {
	Breadcrumb,
	BreadcrumbItem,
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
				<TanStackQueryProvider>
					<TooltipProvider>{children}</TooltipProvider>
				</TanStackQueryProvider>
				<Scripts />
			</body>
		</html>
	);
}

const breadcrumbLabels: Record<string, string> = {
	demo: "Demos",
	db: "Database",
	todos: "Todos",
	"simple-list": "Simple List",
	form: "Forms",
	address: "Address",
	auth: "Auth",
	"sign-in": "Sign In",
	"sign-up": "Sign Up",
};

function DynamicBreadcrumbs() {
	const { pathname } = useLocation();
	const segments = pathname.split("/").filter(Boolean);

	if (segments.length === 0) {
		return (
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbPage>Home</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
		);
	}

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{segments.map((segment, index) => {
					const isLast = index === segments.length - 1;
					const label =
						breadcrumbLabels[segment] ||
						segment.charAt(0).toUpperCase() + segment.slice(1);

					return (
						<React.Fragment key={`${segment}-${index}`}>
							{index > 0 && (
								<BreadcrumbSeparator className="hidden md:block" />
							)}
							<BreadcrumbItem
								className={!isLast ? "hidden md:block" : ""}
							>
								<BreadcrumbPage>{label}</BreadcrumbPage>
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
			</SidebarInset>
			<GlobalNavigationHotkeys />
		</SidebarProvider>
	);
}
