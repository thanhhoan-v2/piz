"use client"
import { getUserById } from "@app/actions/user"
import { type Noti, getNotificationMessage } from "@app/activity/page"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/Avatar"
import { cn } from "@utils/cn"
import { formatDistanceToNow } from "date-fns"
import type { Route } from "next"
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
				<AvatarFallback>
					{senderInfo?.userName?.[0].toUpperCase()}
				</AvatarFallback>
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

function getNotificationLink(notification: Noti): Route {
	const senderIdRoute = `/${notification.senderId}` as Route
	const postIdRoute = `${senderIdRoute}/post/${notification.postId}` as Route
	const commentIdRoute =
		`${postIdRoute}/comment/${notification.commentId}` as Route

	switch (notification.notificationType) {
		case "FOLLOW":
			return senderIdRoute
		case "COMMENT":
			return commentIdRoute
		case "COMMENT_REACTION":
			return commentIdRoute
		case "POST":
			return postIdRoute
		case "POST_REACTION":
			return postIdRoute
		default:
			return "/" as Route
	}
}
