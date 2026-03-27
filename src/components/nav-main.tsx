import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";
import { useState } from "react";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "#/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "#/components/ui/sidebar";

interface NavItem {
	title: string;
	url: string;
	icon?: React.ReactNode;
	isActive?: boolean;
	items?: { title: string; url: string }[];
}

function CollapsibleNavItem({
	item,
	pathname,
}: {
	item: NavItem & { items: { title: string; url: string }[] };
	pathname: string;
}) {
	const [open, setOpen] = useState(
		() =>
			item.isActive ||
			item.items.some((sub) => pathname.startsWith(sub.url)),
	);

	return (
		<Collapsible
			open={open}
			onOpenChange={setOpen}
			className="group/collapsible"
			render={<SidebarMenuItem />}
		>
			<CollapsibleTrigger
				render={<SidebarMenuButton tooltip={item.title} />}
			>
				{item.icon}
				<span>{item.title}</span>
				<ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
			</CollapsibleTrigger>
			<CollapsibleContent>
				<SidebarMenuSub>
					{item.items.map((subItem) => (
						<SidebarMenuSubItem key={subItem.title}>
							<SidebarMenuSubButton
								render={<Link to={subItem.url} />}
								data-active={
									pathname === subItem.url ? true : undefined
								}
							>
								<span>{subItem.title}</span>
							</SidebarMenuSubButton>
						</SidebarMenuSubItem>
					))}
				</SidebarMenuSub>
			</CollapsibleContent>
		</Collapsible>
	);
}

export function NavMain({ items }: { items: NavItem[] }) {
	const { pathname } = useLocation();

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Platform</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) =>
					item.items?.length ? (
						<CollapsibleNavItem
							key={item.title}
							item={
								item as NavItem & {
									items: { title: string; url: string }[];
								}
							}
							pathname={pathname}
						/>
					) : (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								tooltip={item.title}
								render={<Link to={item.url} />}
								data-active={pathname === item.url ? true : undefined}
							>
								{item.icon}
								<span>{item.title}</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					),
				)}
			</SidebarMenu>
		</SidebarGroup>
	);
}
