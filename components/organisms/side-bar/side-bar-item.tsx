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

const sizes =
	"mobile_s:w-[60px] mobile_m:w-[60px] mobile_l:w-[70px] mobile_s:h-[40px] tablet:h-[70px]"

const sideBarItemClass = cn(
	"dark:hover:background-item flex items-center gap-3 rounded-md font-medium text-sm transition-colors hover:bg-muted flex-center",
	sizes,
)

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
				<Button variant="ghost" className={sideBarItemClass}>
					<Icon fill={iconFill} />
				</Button>
			</PostForm>
		)
	}

	// If user is signed in and the href is profile
	if (href === "profile" && userName) {
		return (
			<Link
				prefetch={true}
				href={`/${userName}` as Route}
				aria-disabled={!userName && true}
			>
				<Button
					variant="ghost"
					className={cn(sideBarItemClass, !userName && "pointer-events-none")}
				>
					{!userName ? (
						<UserRoundX className="w-full" fill={iconFill} />
					) : (
						<Icon fill={iconFill} />
					)}
				</Button>
			</Link>
		)
	}

	// If the href is home despite user is authenticated or not
	if (href === ROUTE.HOME)
		return (
			<>
				<Link prefetch={true} href={href as Route} className={sideBarItemClass}>
					<Icon fill={iconFill} />
				</Link>
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
			<Link prefetch={true} href={href as Route} className={sideBarItemClass}>
				<Icon fill={iconFill} />
			</Link>
		</>
	)
}
