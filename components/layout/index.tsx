"use client"
import HeaderBar from "@components/layout/headerBar"
import SideBar from "@components/layout/sideBar"
import { useQueryCreateUser } from "@queries/client/appUser"
import { useUser } from "@stackframe/stack"
import { cn } from "@utils/cn"
// import { useAtomValue } from "jotai"
import React, { useEffect } from "react"

export type SenderInfo = {
	userName: string
	userAvatarUrl: string
}

const AppLayout = ({ children }: { children: React.ReactNode }) => {
	const [isVisible, setIsVisible] = React.useState(true)
	const [lastScrollY, setLastScrollY] = React.useState(0)

	const user = useUser()
	// const customTheme = useAtomValue(customThemeAtom)

	if (user)
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
				{/* {customTheme.value === "light_small_squares" && ( */}
				{/* 	<div className="absolute top-0 z-[-2] h-full w-full bg-white bg-[radial-gradient(#8080800a_1px,#ffffff_1px)] bg-[size:20px_20px]" /> */}
				{/* )} */}
				{/* {customTheme.value === "light_big_squares" && ( */}
				{/* 	<div className="absolute top-0 z-[-2] h-full w-full bg-white bg-[radial-gradient(#f0f0f0_1px,#ffffff_1px)] bg-[size:20px_20px]" /> */}
				{/* )} */}
				{/* {customTheme.value === "light_gradient_violet" && ( */}
				{/* 	<div className="absolute top-0 z-[-2] h-full w-full bg-white bg-[radial-gradient(#63e3_1px,#ffffff_1px)] bg-[size:20px_20px]" /> */}
				{/* )} */}
				{/* {customTheme.value === "dark_gradient_violet" && ( */}
				{/* 	<div className="absolute top-0 z-[-2] h-full w-full bg-[#000000] bg-[radial-gradient(#63e3_1px,#000000_1px)] bg-[size:20px_20px]" /> */}
				{/* )} */}
				{/* {customTheme.value === "dark_small_squares" && ( */}
				{/* 	<div className="absolute top-0 z-[-2] h-full w-full bg-[#000000] bg-[radial-gradient(#4f4f4f2e_1px,#000000_1px)] bg-[size:20px_20px]" /> */}
				{/* )} */}
				{/* {customTheme.value === "dark_dots" && ( */}
				<div className="absolute top-0 z-[-2] h-full w-full bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00000d_1px)] bg-[size:20px_20px]" />
				{/* )} */}

				{/* <div className="absolute top-0 ml-[10px] z-[-2] h-full w-full"> */}
				{/* 	<FlickeringGrid */}
				{/* 		className="z-0 absolute inset-0 size-full" */}
				{/* 		squareSize={10} */}
				{/* 		gridGap={1} */}
				{/* 		color="#6B7280" */}
				{/* 		// color="#8cd867" */}
				{/* 		maxOpacity={0.5} */}
				{/* 		flickerChance={0.1} */}
				{/* 		// height={1600} */}
				{/* 		// width={1600} */}
				{/* 	/> */}
				{/* </div> */}

				<HeaderBar
					className={cn(
						"fixed top-0 right-0 left-0 z-50 flex-between bg-background px-3 py-2 shadow-md transition-transform duration-300 ease-in-out",
						headerBarIsVisible,
					)}
				/>

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
		</>
	)
}

export { AppLayout }
