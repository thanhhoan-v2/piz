"use client"

import { userAtom } from "@atoms/user"
import { Button } from "@components/atoms/button"
import PostForm from "@components/molecules/form/post-form"
import WelcomeModal from "@components/molecules/modal/welcome-modal"
import { ROUTE } from "@constants/route"
import { cn } from "@utils/cn"
import { useAtomValue } from "jotai"
import { type LucideIcon, UserRoundX } from "lucide-react"
import type { Route } from "next"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"

type SideBarItemProps = {
	href: string
	icon: LucideIcon
}

const sideBarItemClass =
	"dark:hover:background-item flex items-center gap-3 rounded-md p-4 font-medium text-sm transition-colors hover:bg-muted size-[70px]"

export default function SideBarItem({ href, icon: Icon }: SideBarItemProps) {
	const pathname = usePathname()
	const { theme } = useTheme()

	// Get user data from query cache
	const user = useAtomValue(userAtom)
	const userName = user?.user_metadata?.userName

	// Icon fill for different pages
	const iconFill =
		pathname === href ? (theme === "dark" ? "white" : "black") : "none"

	// If user is signed in and the href is post
	if (href === "post" && userName) {
		return (
			<PostForm>
				<div className={sideBarItemClass}>
					<Icon fill={iconFill} />
				</div>
			</PostForm>
		)
	}

	// If user is signed in and the href is profile
	if (href === "profile" && userName) {
		return (
			<Link
				prefetch={true}
				href={`/${userName}`}
				className={cn(sideBarItemClass, !userName && "pointer-events-none")}
				aria-disabled={!userName && "true"}
			>
				{!userName ? <UserRoundX fill={iconFill} /> : <Icon fill={iconFill} />}
			</Link>
		)
	}

	// If the href is home despite user authentication
	if (href === ROUTE.HOME)
		return (
			<>
				<Button variant="ghost" className={sideBarItemClass}>
					<Link
						prefetch={true}
						href={href as Route}
						className={sideBarItemClass}
					>
						<Icon fill={iconFill} />
					</Link>
				</Button>
			</>
		)

	// If user is not signed in
	if (!userName) {
		return (
			<>
				<WelcomeModal>
					<Button variant="ghost" className={sideBarItemClass}>
						<Icon fill={iconFill} />
					</Button>
				</WelcomeModal>
			</>
		)
	}

	// If user is signed in
	return (
		<>
			<Button variant="ghost" className={sideBarItemClass} asChild>
				<Link prefetch={true} href={href as Route} className={sideBarItemClass}>
					<Icon fill={iconFill} />
				</Link>
			</Button>
		</>
	)
}
