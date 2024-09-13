"use client"

import { Avatar, AvatarImage } from "@components/ui/Avatar"
import { useSupabaseBrowser } from "@hooks/supabase/browser"
import type {
	Notification as INotification,
	NotificationType,
} from "@prisma/client"
import { useQueryAppUser } from "@queries/client/appUser"
import { useQueryAllNotifications } from "@queries/client/noti"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { useQueryClient } from "@tanstack/react-query"
import { avatarPlaceholder } from "@utils/image.helpers"
import { queryKey } from "@utils/queryKeyFactory"
import React from "react"

const notiMap: Record<string, string> = {
	FOLLOW: "followed",
	FOLLOW_SUGGEST: "should follow",
	COMMENT: "commented",
	TAG: "tagged",
	REACT: "reacted",
}

export default function ActivityPage() {
	const [notifications, setNotifications] = React.useState<
		INotification[] | undefined
	>([])

	const {
		data: user,
		isLoading: isUserLoading,
		isError: isUserError,
	} = useQueryAppUser()

	const {
		data: notiList,
		isLoading,
		isSuccess,
		isError,
		isFetching,
	} = useQueryAllNotifications({ receiverId: user?.id })

	// Set notifications if it's fetched successfully
	React.useEffect(() => {
		setNotifications(notiList)
	}, [notiList])

	// Subscribe to notification changes
	const supabase = useSupabaseBrowser()
	const queryClient = useQueryClient()

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
				(payload: { new: Notification }) => {
					queryClient.setQueryData<Notification[] | undefined>(
						queryKey.noti.all,
						(oldData) => {
							return oldData ? [payload.new, ...oldData] : [payload.new]
						},
					)
				},
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel).catch((error) => {
				console.error("Error removing channel:", error)
			})
		}
	}, [supabase, queryClient])

	if (isUserError) return <div>Error fetching your information 😢</div>
	if (isUserLoading) return <div>Fetching your information...</div>

	if (isError) return <div>Error loading activities 😢</div>
	if (isLoading || isFetching) return <div>Loading activities...</div>

	if (notifications && notifications.length === 0)
		return <p>No one cares about you 😢</p>

	if (isSuccess)
		return (
			<>
				<div className="flex-col gap-3">
					{notifications?.map((noti) => {
						return (
							<div
								key={noti.id}
								className="w-[600px] flex-y-center gap-1 rounded-lg bg-background-item p-6"
							>
								<div className="flex-y-center gap-3">
									<Avatar>
										<AvatarImage
											src={noti.senderAvatarUrl ?? avatarPlaceholder}
										/>
									</Avatar>
									<p>{noti.senderUserName}</p>
								</div>
								<div>
									<p>{notiMap[noti.notificationType as NotificationType]}</p>
								</div>
								<div>
									<p>you</p>
								</div>
							</div>
						)
					})}
				</div>
			</>
		)
}
