import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";
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
	SidebarTrigger,
} from "#/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<div className="flex items-center gap-2">
					<SidebarMenu className="min-w-0 flex-1">
						<SidebarMenuItem>
							<SidebarMenuButton
								size="lg"
								render={<Link to="/" />}
								tooltip="Electric Start"
							>
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
									<Zap className="size-4" />
								</div>
								<div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
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
					<SidebarTrigger className="shrink-0 md:hidden" />
				</div>
			</SidebarHeader>
			<SidebarContent>
				<NavMain />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
