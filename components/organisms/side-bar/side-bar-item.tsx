"use client"

import { Button } from "@components/atoms/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@components/atoms/dialog"
import SideBarMobileDrawer from "@components/organisms/side-bar/side-bar-mobile-drawer"
import { ROUTE } from "@constants/route"
import { useUserStore } from "@stores/user-store"
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
	"dark:hover:background-item flex items-center gap-3 rounded-md p-4 font-medium text-sm transition-colors hover:bg-muted size-[70px]"

export default function SideBarItem({
	href,
	icon: Icon,
}: SideBarItemProps) {
	const pathname = usePathname()
	const [isPostOpen, setOpenPost] = React.useState(false)
	const [isWelcomeModalOpen, toggleWelcomeModal] =
		React.useState(false)
	const { theme } = useTheme()

	const userName = useUserStore((state) => state.userName)
	const isSignedIn = useUserStore((state) => state.isSignedIn)

	const iconFill =
		pathname === href
			? theme === "dark"
				? "white"
				: "black"
			: "none"

	if (href === "post" && isSignedIn) {
		return (
			<SideBarMobileDrawer isOpen={isPostOpen} setOpen={setOpenPost}>
				<div className={sideBarItemClass}>
					<Icon fill={iconFill} />
				</div>
			</SideBarMobileDrawer>
		)
	}

	if (href === "profile" && isSignedIn) {
		return (
			<Link
				prefetch={true}
				href={`/${userName}`}
				className={cn(
					sideBarItemClass,
					!userName && "pointer-events-none",
				)}
				aria-disabled={!userName && "true"}
			>
				{!userName ? (
					<UserRoundX fill={iconFill} />
				) : (
					<Icon fill={iconFill} />
				)}
			</Link>
		)
	}

	const handleUnauthorizedUser = () => {
		console.log("handleUnauthorized")
		toggleWelcomeModal(!isWelcomeModalOpen)
	}

	if (!isSignedIn) {
		return (
			<>
				<Button
					variant="ghost"
					className={sideBarItemClass}
					onClick={handleUnauthorizedUser}
				>
					<Icon fill={iconFill} />
				</Button>

				{/* welcome modal */}
				<Dialog
					open={isWelcomeModalOpen}
					onOpenChange={toggleWelcomeModal}
				>
					<DialogContent className="min-h-[300px] w-[80vw] rounded-lg">
						<DialogHeader className="mt-8">
							<DialogTitle className="font-bold tablet:text-3xl">
								<span className="text-md underline decoration-pink-400 decoration-wavy underline-offset-4">
									Getting started&nbsp;
								</span>
								with Piz
							</DialogTitle>
						</DialogHeader>
						<DialogDescription className="text-center tablet:text-lg">
							Join&nbsp;
							<span className="font-bold text-pink-400">Piz</span> to
							share thoughts, find out what's going on, follow your
							people and more.
						</DialogDescription>
						<div className="flex-center ">
							<Button
								asChild
								className="max-w-[200px]"
								onClick={() => toggleWelcomeModal(false)}
							>
								<Link href={ROUTE.SIGN_IN}>Explore</Link>
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</>
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
