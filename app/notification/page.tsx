"use client"
import { NotificationItem } from "@components/ui/notification/NotificationItem"
import { useQueryNotifications } from "@queries/client/noti"
import { useUser } from "@stackframe/stack"
import { useEffect, useRef } from "react"

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

export default function NotificationPage() {
	const user = useUser()
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const previousNotifications = useRef<any[]>([])

	const { data: notifications, isSuccess } = useQueryNotifications(user?.id)

	useEffect(() => {
		if (isSuccess && notifications) {
			const newNotifications = notifications.filter(
				(notification) =>
					!previousNotifications.current.find((prev) => prev.id === notification.id),
			)
			previousNotifications.current = notifications
		}
	}, [notifications, isSuccess])

	return (
		<div className="mt-[100px] flex-col gap-4">
			{notifications ? (
				notifications?.map((notification) => (
					<NotificationItem key={notification.id} notification={notification} />
				))
			) : (
				<>No notifications</>
			)}
		</div>
	)
}
