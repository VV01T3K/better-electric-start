import {
	ClipboardList,
	Files,
	FileInputIcon,
	Home,
	type LucideIcon,
	Zap,
} from "lucide-react";

import type { NavLinkArray } from "#/integrations/tanstack/hotkeys/nav-links.ts";

type NavigationLink = {
	to: NavLinkArray[number]["to"];
	label: string;
	icon: LucideIcon;
	hotkey: NavLinkArray[number]["hotkey"];
	public?: true;
};

export type BreadcrumbSegment = {
	label: string;
	to?: NavLinkArray[number]["to"];
};

export const navLinks = [
	{
		to: "/",
		label: "Home",
		icon: Home,
		hotkey: "1",
		public: true,
	},
	{
		to: "/demo/db/todos",
		label: "Todos",
		icon: ClipboardList,
		hotkey: "2",
	},
	{
		to: "/demo/db/simple-list",
		label: "Simple List",
		icon: Zap,
		hotkey: "3",
	},
	{
		to: "/demo/db/files",
		label: "Files",
		icon: Files,
		hotkey: "4",
	},
	{
		to: "/demo/form/address",
		label: "Address Form",
		icon: FileInputIcon,
		hotkey: "5",
	},
] as const satisfies ReadonlyArray<NavigationLink>;

const publicNavLinks = navLinks.filter(
	(link): link is (typeof navLinks)[number] & { public: true } =>
		"public" in link && link.public === true,
) as NavLinkArray;

const breadcrumbLabels = new Map<string, string>([
	...navLinks.map((link) => [link.to, link.label] as const),
	["/auth/sign-in", "Sign In"],
	["/auth/sign-up", "Sign Up"],
]);

export function getVisibleNavLinks(isAuthenticated: boolean): NavLinkArray {
	return isAuthenticated ? navLinks : publicNavLinks;
}

const homeBreadcrumb: BreadcrumbSegment = { label: "Home" };
const homeLinkBreadcrumb: BreadcrumbSegment = { label: "Home", to: "/" };

export function getBreadcrumbItems(pathname: string): BreadcrumbSegment[] {
	if (pathname === "/") {
		return [homeBreadcrumb];
	}

	const exactMatch = breadcrumbLabels.get(pathname);
	if (exactMatch) {
		return [homeLinkBreadcrumb, { label: exactMatch }];
	}

	return [homeLinkBreadcrumb, { label: humanizePathname(pathname) }];
}

function humanizePathname(pathname: string) {
	return pathname
		.split("/")
		.filter(Boolean)
		.map((segment) =>
			segment
				.split("-")
				.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
				.join(" "),
		)
		.join(" / ");
}
