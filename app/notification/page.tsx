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
	notificationType:
		| ("FOLLOW" | "POST" | "POST_REACTION" | "COMMENT" | "COMMENT_REACTION" | "TEAM_JOIN_REQUEST")
		| null
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
			// Store the current notifications for comparison in the next update
			previousNotifications.current = notifications
		}
	}, [notifications, isSuccess])

	return (
		<div className="flex-col gap-4 mt-[100px]">
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
