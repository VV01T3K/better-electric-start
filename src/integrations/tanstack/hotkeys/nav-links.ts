import type { Hotkey } from "@tanstack/react-hotkeys";
import type { RegisteredRouter, ValidateToPath } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export type NavLink = {
	to: ValidateToPath<RegisteredRouter>;
	label: string;
	icon: LucideIcon;
	hotkey: Hotkey;
	public?: true;
};

export type NavLinkArray = ReadonlyArray<NavLink>;
