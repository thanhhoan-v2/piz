"use client"
import { getUserById } from "@app/actions/user"
import type { Noti } from "@app/notification/page"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/Avatar"
import { cn } from "@utils/cn"
import { getNotificationLink, getNotificationMessage } from "@utils/notification.helpers"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import React from "react"

export type SenderInfo = {
	userName: string
	userAvatarUrl: string
}

export function NotificationItem({ notification }: { notification: Noti }) {
	const [senderInfo, setSenderInfo] = React.useState<SenderInfo>()

	React.useEffect(() => {
		const fetchUserInfo = async () => {
			if (notification.senderId) {
				const fetchedSenderInfo = await getUserById(notification.senderId)
				setSenderInfo(fetchedSenderInfo)
			}
		}
		fetchUserInfo()
	}, [notification.senderId])

	return (
		<Link
			href={getNotificationLink(notification)}
			className={cn(
				"flex w-[70vw] items-center gap-4 rounded-lg p-4 hover:bg-background-item/80",
				!notification.isRead && "bg-background-item",
			)}
		>
			<Avatar>
				<AvatarImage src={senderInfo?.userAvatarUrl} />
				<AvatarFallback>{senderInfo?.userName?.[0].toUpperCase()}</AvatarFallback>
			</Avatar>
			<div className="flex-1">
				<p>{getNotificationMessage(notification, senderInfo)}</p>
				<p className="text-muted-foreground text-sm">
					{formatDistanceToNow(new Date(notification.createdAt), {
						addSuffix: true,
					})}
				</p>
			</div>
		</Link>
	)
}
