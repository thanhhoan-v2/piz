"use client";
import SideBarMobileDrawer from "@components/organisms/side-bar/side-bar-mobile-drawer";
import type { LucideIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type SideBarItemProps = {
	href: string;
	icon: LucideIcon;
};

const sideBarItemClass =
	"dark:hover:background-item flex items-center gap-3 rounded-md p-4 font-medium text-sm transition-colors hover:bg-muted";

export default function SideBarItem({
	href,
	icon: Icon,
}: SideBarItemProps) {
	const pathname = usePathname();
	const [isPostOpen, setOpenPost] = React.useState(false);
	const { theme } = useTheme();

	const iconFill =
		pathname === href
			? theme === "dark"
				? "white"
				: "black"
			: "none";

	if (href === "post") {
		return (
			<SideBarMobileDrawer isOpen={isPostOpen} setOpen={setOpenPost}>
				<div className={sideBarItemClass}>
					<Icon fill={iconFill} />
				</div>
			</SideBarMobileDrawer>
		);
	}

	return (
		<>
			<Link prefetch={true} href={href} className={sideBarItemClass}>
				<Icon fill={iconFill} />
			</Link>
		</>
	);
}
