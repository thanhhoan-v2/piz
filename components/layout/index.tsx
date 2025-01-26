"use client"
import { customThemeAtom } from "@atoms/theme"
import HeaderBar from "@components/layout/headerBar"
import SideBar from "@components/layout/sideBar"
import { useToast } from "@components/ui/toast/useToast"
import { useQueryCreateUser } from "@queries/client/appUser"
import { useUser } from "@stackframe/stack"
import { cn } from "@utils/cn"
import { useAtomValue } from "jotai"
import { useTheme } from "next-themes"
import React, { useEffect } from "react"

export type SenderInfo = {
	userName: string
	avatarUrl: string
}

const AppLayout = ({ children }: { children: React.ReactNode }) => {
	const [isVisible, setIsVisible] = React.useState(true)
	const [lastScrollY, setLastScrollY] = React.useState(0)
	const [newNotiId, setNewNotiId] = React.useState<number | null>(null)
	const [senderInfo, setSenderInfo] = React.useState<
		Record<string, SenderInfo>
	>({})

	const user = useUser()
	const { theme } = useTheme()
	const { toast } = useToast()
	const customTheme = useAtomValue(customThemeAtom)

	useQueryCreateUser({
		id: user?.id,
		email: user?.primaryEmail,
		userName: user?.displayName,
		userAvatarUrl: user?.profileImageUrl,
	})

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

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	// const previousNotifications = useRef<any[]>([])
	// const { data: notifications } = useQueryNotifications(user?.id)

	// useEffect(() => {
	// 	if (notifications) {
	// 		const newNotifications = notifications.filter(
	// 			(notification) =>
	// 				!previousNotifications.current.find(
	// 					(prev) => prev.id === notification.id,
	// 				),
	// 		)
	//
	// 		// biome-ignore lint/complexity/noForEach: <explanation>
	// 		newNotifications.forEach(async (notification) => {
	// 			if (notification.notificationType === "FOLLOW") {
	// 				// Fetch sender info
	// 				const sender = await getUserById(notification.senderId)
	// 				if (sender) {
	// 					setSenderInfo((prev) => ({
	// 						...prev,
	// 						[notification.senderId]: sender,
	// 					}))
	//
	// 					toast({
	// 						title: "New Follower",
	// 						description: (
	// 							<div className="flex items-center space-x-2">
	// 								<Avatar className="h-8 w-8">
	// 									<AvatarImage
	// 										src={sender.avatarUrl ?? avatarPlaceholder}
	// 										alt="Follower Avatar"
	// 									/>
	// 								</Avatar>
	// 								<div className="flex-y-center gap-1 font-medium">
	// 									<p className="font-bold">{sender.userName}</p>
	// 									<p>is following you</p>
	// 								</div>
	// 							</div>
	// 						),
	// 						duration: 3000,
	// 					})
	// 				}
	// 			}
	// 		})
	//
	// 		previousNotifications.current = notifications
	// 	}
	// }, [notifications, toast])

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
