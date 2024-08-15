"use client"

import SideBarMobileDrawer from "@components/organisms/side-bar/side-bar-mobile-drawer"
import useFetchUser from "@hooks/useFetchUser"
import { cn } from "@utils/cn"
import { type LucideIcon, UserRoundX } from "lucide-react"
import type { Route } from "next"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

type SideBarItemProps = {
	href: string
	icon: LucideIcon
}

const sideBarItemClass =
	"dark:hover:background-item flex items-center gap-3 rounded-md p-4 font-medium text-sm transition-colors hover:bg-muted"

export default function SideBarItem({
	href,
	icon: Icon,
}: SideBarItemProps) {
	const pathname = usePathname()
	const [isPostOpen, setOpenPost] = React.useState(false)
	const { theme } = useTheme()
	const { user, loading } = useFetchUser()

	const iconFill =
		pathname === href
			? theme === "dark"
				? "white"
				: "black"
			: "none"

	if (href === "post") {
		return (
			<SideBarMobileDrawer isOpen={isPostOpen} setOpen={setOpenPost}>
				<div className={sideBarItemClass}>
					<Icon fill={iconFill} />
				</div>
			</SideBarMobileDrawer>
		)
	}

	if (href === "profile") {
		const username = user?.user_metadata?.user_name
		return (
			<Link
				prefetch={true}
				href={`/${username}`}
				className={cn(
					sideBarItemClass,
					loading && "pointer-events-none",
				)}
				aria-disabled={loading && "true"}
			>
				{loading ? (
					<UserRoundX fill={iconFill} />
				) : (
					<Icon fill={iconFill} />
				)}
			</Link>
		)
	}

	return (
		<>
			<Link
				prefetch={true}
				href={href as Route}
				className={sideBarItemClass}
			>
				<Icon fill={iconFill} />
			</Link>
		</>
	)
}
