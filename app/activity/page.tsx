"use client"

import { Avatar, AvatarImage } from "@components/atoms/avatar"
import { avatarPlaceholder } from "@constants/image-placeholder"
import { useQueryAppUser } from "@hooks/queries/app-user"
import { useQueryAllNotifications } from "@hooks/queries/noti"
import type { Notification, NotificationType } from "@prisma/client"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { createSupabaseClientForBrowser } from "@utils/supabase/client"
import React from "react"

const notiMap: Record<NotificationType, string> = {
	FOLLOW: "followed",
	FOLLOW_SUGGEST: "should follow",
	COMMENT: "commented",
	TAG: "tagged",
	REACT: "reacted",
}

export default function ActivityPage() {
	const [notifications, setNotifications] = React.useState<
		Notification[] | undefined
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
	const supabase = createSupabaseClientForBrowser()
	React.useEffect(() => {
		const channel: RealtimeChannel = supabase
			.channel("realtime notifications")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "Notification",
				},
				(payload: { new: Notification }) => {
					console.log({ payload })
				},
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel).catch((error) => {
				console.error("Error removing channel:", error)
			})
		}
	}, [supabase])

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
