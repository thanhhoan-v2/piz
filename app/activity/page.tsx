"use client"

import { Avatar, AvatarImage } from "@components/ui/Avatar"
import type { NotificationType } from "@prisma/client"
import { useQueryAppUser } from "@queries/client/appUser"
import { useUser } from "@stackframe/stack"
import { avatarPlaceholder } from "@utils/image.helpers"
import { useEffect, useRef } from "react"
import { useToast } from "@components/ui/toast/useToast"
import { NotificationItem, SenderInfo } from "@components/ui/notification/NotificationItem"
import { useQueryNotifications } from "@queries/client/noti"
import React from "react"
import { getUserById } from "@app/actions/user"

const notiMap: Record<string, string> = {
	FOLLOW: "followed",
	FOLLOW_SUGGEST: "should follow",
	COMMENT: "commented",
	TAG: "tagged",
	REACT: "reacted",
}


export type Noti = {
	id: string
	senderId: string
	receiverId: string
	postId: string | null
	commentId: string | null
	notificationType: ("FOLLOW" | "POST" | "POST_REACTION" | "COMMENT" | "COMMENT_REACTION") | null
	isRead: boolean
	isDeleted: boolean
	createdAt: Date
	updatedAt: Date | null
}

/**
 * Page showing all the activities of the user.
 *
 * It fetches the list of notifications for the user and displays each one
 * as a card with the sender's avatar, the sender's username, the type of
 * notification, and the text "you".
 *
 * If there is an error fetching the user's information, it displays an error
 * message. If there is an error loading the activities, it displays an error
 * message. If the activities are loading, it displays a loading message.
 *
 * Otherwise, it displays a list of all the user's activities.
 */
export default function ActivityPage() {
	const user = useUser()
	const { toast } = useToast()
	const previousNotifications = useRef<any[]>([])

	const { data: notifications, isSuccess } = useQueryNotifications(user?.id)

	useEffect(() => {
		if (isSuccess && notifications) {
			const newNotifications = notifications.filter(
				notification => !previousNotifications.current.find(
					prev => prev.id === notification.id
				)
			)
			previousNotifications.current = notifications
		}
	}, [notifications, isSuccess, toast])

	return (
		<div className="mt-[100px] flex-col gap-4">
			{notifications ? notifications?.map(notification => (
				<NotificationItem
					key={notification.id}
					notification={notification}
				/>
			)) : <>No notifications</>}
		</div>
	)
}

export function getNotificationMessage(notification: Noti, senderInfo?: SenderInfo) {
	if (!senderInfo) return "Loading..."

	switch (notification.notificationType) {
		case "FOLLOW":
			return `${senderInfo.userName} started following you`
		case "COMMENT":
			return `${senderInfo.userName} commented on your post`
		case "COMMENT_REACTION":
			return `${senderInfo.userName} reacted on your comment`
		case "POST":
			return `${senderInfo.userName} created a new post`
		case "POST_REACTION":
			return `${senderInfo.userName} reacted on your post`
		default:
			return "New notification"
	}
}

