import { Link } from "@tanstack/react-router";
import { Database, FileInputIcon, Zap } from "lucide-react";
import type * as React from "react";

import { NavMain } from "#/components/nav-main";
import { NavUser } from "#/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "#/components/ui/sidebar";

const data = {
	navMain: [
		{
			title: "Database",
			url: "#",
			icon: <Database />,
			isActive: true,
			items: [
				{ title: "Todos", url: "/demo/db/todos" },
				{ title: "Simple List", url: "/demo/db/simple-list" },
			],
		},
		{
			title: "Forms",
			url: "#",
			icon: <FileInputIcon />,
			items: [{ title: "Address", url: "/demo/form/address" }],
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							render={<Link to="/" />}
							tooltip="Electric Start"
						>
							<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary">
								<Zap className="size-4 text-primary-foreground" />
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">
									Electric Start
								</span>
								<span className="truncate text-xs text-muted-foreground">
									Local-first sync
								</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
