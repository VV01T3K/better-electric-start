import { Link, useNavigate } from "@tanstack/react-router";
import {
	BadgeCheckIcon,
	ChevronsUpDownIcon,
	LogInIcon,
	LogOutIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "#/components/ui/sidebar";
import { authClient } from "#/integrations/better-auth/client";
import { useSession } from "#/integrations/better-auth/useSession";

export function NavUser() {
	const { isMobile } = useSidebar();
	const { isAuthenticated, user } = useSession();
	const navigate = useNavigate();

	if (!isAuthenticated || !user) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton
						size="lg"
						render={<Link to="/auth/sign-in" />}
					>
						<LogInIcon className="size-4" />
						<span>Sign in</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	const initials = (user.name || user.email || "U")
		.split(/[\s@]/)
		.map((s: string) => s[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();

	async function handleSignOut() {
		await authClient.signOut();
		await navigate({ to: "/auth/sign-in" });
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<SidebarMenuButton
								size="lg"
								className="aria-expanded:bg-muted"
							/>
						}
					>
						<Avatar>
							<AvatarImage
								src={user.image || ""}
								alt={user.name || ""}
							/>
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium">
								{user.name || "User"}
							</span>
							<span className="truncate text-xs">{user.email}</span>
						</div>
						<ChevronsUpDownIcon className="ml-auto size-4" />
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuGroup>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<Avatar>
										<AvatarImage
											src={user.image || ""}
											alt={user.name || ""}
										/>
										<AvatarFallback>{initials}</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-medium">
											{user.name || "User"}
										</span>
										<span className="truncate text-xs">
											{user.email}
										</span>
									</div>
								</div>
							</DropdownMenuLabel>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<BadgeCheckIcon />
								Account
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => void handleSignOut()}>
							<LogOutIcon />
							Sign out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
