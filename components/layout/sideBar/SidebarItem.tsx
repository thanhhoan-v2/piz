"use client"
import { Button } from "@components/ui/Button"
import CollabRoomInputModal from "@components/ui/modal/CollabRoomInputModal"
import WelcomeModal from "@components/ui/modal/WelcomeModal"
import PostForm from "@components/ui/post-form/PostForm"
import { ROUTE } from "@constants/route"
import { useUser } from "@stackframe/stack"
import { cn } from "@utils/cn"
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
	"cursor-pointer dark:hover:background-item flex items-center gap-3 rounded-md font-medium text-sm transition-colors hover:bg-muted flex-center",
	sizes,
)

export default function SideBarItem({ href, icon: Icon }: SideBarItemProps) {
	const pathname = usePathname()
	const { theme } = useTheme()

	// Get user data from query cache
	const user = useUser()
	const userId = user?.id

	// Icon fill for different pages
	const iconFill = pathname === href ? (theme === "dark" ? "white" : "black") : "none"

	// If user is signed in and the href is post
	if (href === "post" && userId) {
		return (
			<PostForm>
				<Button variant="ghost" className={sideBarItemClass}>
					<Icon fill={iconFill} />
				</Button>
			</PostForm>
		)
	}

	// If user is signed in and the href is profile
	if (href === "profile" && userId) {
		return (
			<Link prefetch={true} href={`/${userId}` as Route} aria-disabled={!userId && true}>
				<Button variant="ghost" className={cn(sideBarItemClass, !userId && "pointer-events-none")}>
					{!userId ? <UserRoundX className="w-full" /> : <Icon />}
				</Button>
			</Link>
		)
	}

	// If user is signed in and the href is collab
	if (href === "collab" && userId) {
		return (
			<CollabRoomInputModal>
				<Button variant="ghost" className={sideBarItemClass}>
					<Icon fill={iconFill} />
				</Button>
			</CollabRoomInputModal>
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
	if (!userId) {
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
