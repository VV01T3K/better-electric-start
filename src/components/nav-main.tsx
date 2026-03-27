import { Link, useLocation } from "@tanstack/react-router";

import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "#/components/ui/sidebar";
import { useSession } from "#/integrations/better-auth/useSession";
import { getVisibleNavLinks } from "#/lib/navigation";

export function NavMain() {
	const { pathname } = useLocation();
	const { isAuthenticated } = useSession();
	const visibleNavLinks = getVisibleNavLinks(isAuthenticated);

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Navigation</SidebarGroupLabel>
			<SidebarMenu>
				{visibleNavLinks.map((link) => (
					<SidebarMenuItem key={link.to}>
						<SidebarMenuButton
							tooltip={`${link.label} (${link.hotkey})`}
							isActive={pathname === link.to}
							render={<Link to={link.to} />}
						>
							<link.icon />
							<span>{link.label}</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
