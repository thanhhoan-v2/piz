"use client"

import HeaderBar from "@components/layout/headerBar"
import SideBar from "@components/layout/sideBar"
import { Avatar, AvatarImage } from "@components/ui/Avatar"
import { useToast } from "@components/ui/toast/useToast"
import { useSupabaseBrowser } from "@hooks/supabase/browser"
import type { Notification as INotification } from "@prisma/client"
import { useQueryNotification } from "@queries/client/noti"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@utils/cn"
import { avatarPlaceholder } from "@utils/image.helpers"
import React from "react"
import { useEffect } from "react"

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
	const supabase = useSupabaseBrowser()
	const queryClient = useQueryClient()
	const { toast } = useToast()
	React.useEffect(() => {
		const channel: RealtimeChannel = supabase
			.channel("realtime:notifications")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "Notification",
				},
				(payload: { new: INotification }) => {
					console.log(payload)
					// queryClient.setQueryData<INotification[] | undefined>(
					// 	queryKey.noti.all,
					// 	(oldData) => {
					// 		return oldData ? [payload.new, ...oldData] : [payload.new]
					// 	},
					// )

					setNewNotiId(payload.new.id)
				},
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel).catch((error) => {
				console.error("<< Noti << client >> Error removing channel:", error)
			})
		}
	}, [supabase])

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
		;() => setNewNotiId(null)
	}, [isSuccess, newNoti, toast])

	return (
		<>
			<div className="flex w-full flex-col pt-[70px] text-foreground transition-colors duration-300">
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
