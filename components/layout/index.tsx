"use client"
import { customThemeAtom } from "@atoms/theme"
import HeaderBar from "@components/layout/headerBar"
import SideBar from "@components/layout/sideBar"
import { Avatar, AvatarImage } from "@components/ui/Avatar"
import { useToast } from "@components/ui/toast/useToast"
import { useQueryCreateUser } from "@queries/client/appUser"
import { useQueryNotification } from "@queries/client/noti"
import { useUser } from "@stackframe/stack"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@utils/cn"
import { avatarPlaceholder } from "@utils/image.helpers"
import { useAtomValue } from "jotai"
import { useTheme } from "next-themes"
import React from "react"
import { useEffect } from "react"

/**
 * The root component for all pages. It provides a header bar and a side bar.
 * The header bar is fixed to the top of the screen and contains a logo, a
 * search bar, and a button to show/hide the side bar.
 * The side bar is fixed to the left side of the screen and contains a list of
 * links to different pages.
 * The main content of the page is rendered in the middle of the screen.
 * The theme of the app is applied to the component.
 * The component listens for changes to the theme and updates the styles
 * accordingly.
 * The component also listens for changes to the user and updates the user
 * information in the header bar accordingly.
 * The component renders a toast notification when a new follower is detected.
 * The toast notification contains the name and avatar of the new follower.
 * The component renders a spinner when the user is loading.
 */
const AppLayout = ({ children }: { children: React.ReactNode }) => {
	const [isVisible, setIsVisible] = React.useState(true)
	const [lastScrollY, setLastScrollY] = React.useState(0)
	const [newNotiId, setNewNotiId] = React.useState<number | null>(null)

	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY

			if (currentScrollY > lastScrollY) {
				setIsVisible(false)
			} else {
				setIsVisible(true)
			}

			setLastScrollY(currentScrollY)
		}

		window.addEventListener("scroll", handleScroll, { passive: true })

		return () => window.removeEventListener("scroll", handleScroll)
	}, [lastScrollY])

	const headerBarIsVisible = isVisible ? "transform-y-0" : "-translate-y-full"
	const sideBarIsVisible = isVisible ? "transform-y-0" : "translate-y-full"

	// Subscribe to notification changes
	const queryClient = useQueryClient()
	const { toast } = useToast()

	const { data: newNoti, isSuccess } = useQueryNotification({
		notificationId: newNotiId,
	})
	useEffect(() => {
		if (isSuccess && newNoti) {
			toast({
				title: "New follower",
				description: (
					<div className="flex items-center space-x-2">
						<Avatar className="h-8 w-8">
							<AvatarImage
								src={newNoti.sender?.avatarUrl ?? avatarPlaceholder}
								alt="Follower Avatar"
							/>
						</Avatar>
						<div className="flex-y-center gap-1 font-medium">
							<p className="font-bold">{newNoti.sender?.userName}</p>
							<p>is following you</p>
						</div>
					</div>
				),
			})
		}
		; () => setNewNotiId(null)
	}, [isSuccess, newNoti, toast])

	const { theme } = useTheme()
	const customTheme = useAtomValue(customThemeAtom)

	const user = useUser()
	if (user) {
		const {
			id,
			displayName: userName,
			// displayName: fullName,
			primaryEmail: email,
			profileImageUrl: avatarUrl,
		} = user

		if (userName && email && avatarUrl) {
			const newUser = useQueryCreateUser(id, userName, email, avatarUrl)
		}
	}

	return (
		<>
			<div className="relative flex h-screen-auto w-full flex-col text-foreground transition-colors duration-300">
				{customTheme.value === "light_small_squares" && (
					<div className="-z-10 absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] bg-white" />
				)}
				{customTheme.value === "light_big_squares" && (
					<div className="-z-10 absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] bg-white" />
				)}
				{customTheme.value === "light_gradient_violet" && (
					<div className="-z-10 absolute inset-0 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]" />
				)}
				{customTheme.value === "dark_gradient_violet" && (
					<div className="-z-10 absolute inset-0 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]" />
				)}
				{customTheme.value === "dark_small_squares" && (
					<div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
				)}
				{customTheme.value === "dark_dots" && (
					<div className="absolute top-0 z-[-2] h-full w-full bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00000d_1px)] bg-[size:20px_20px]" />
				)}

				<HeaderBar
					className={cn(
						"fixed top-0 right-0 left-0 z-50 flex-between bg-background px-3 py-2 shadow-md transition-transform duration-300 ease-in-out",
						headerBarIsVisible,
					)}
				/>

				<div>
					<SideBar
						mobileSideBarClassName={cn(
							"fixed shadow-md transition-transform duration-300 ease-in-out",
							sideBarIsVisible,
						)}
					/>
					<main className="mobile_s:mx-1 ml-[100px] mobile_s:ml-0 h-auto mobile_s:w-full flex-center">
						{children}
					</main>
				</div>
			</div>
		</>
	)
}

export { AppLayout }
