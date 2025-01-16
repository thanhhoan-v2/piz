"use client"
import { getAllNotifications } from "@queries/server/noti"
import { useQuery } from "@tanstack/react-query"
import { queryKey } from "@utils/queryKeyFactory"

export const useQueryNotifications = (userId?: string) => {
	return useQuery({
		queryKey: queryKey.noti.all,
		queryFn: async () => {
			if (!userId) return []
			return getAllNotifications({ receiverId: userId })
		},
		enabled: !!userId,
		refetchInterval: 3000,
		refetchIntervalInBackground: true,
		// select: (data) => {
		// 	return data.map((notification) => ({
		// 		...notification,
		// 		formattedMessage: getNotificationMessage(notification),
		// 	}))
		// },
	})
}

function getNotificationMessage(notification: any) {
	const senderName = notification.sender.userName

	switch (notification.notificationType) {
		case "REACT":
			return `${senderName} reacted to your post`
		case "COMMENT":
			return `${senderName} commented on your post: "${notification.comment.content.substring(0, 50)}..."`
		case "NEW_POST":
			return `${senderName} created a new post`
		default:
			return "New notification"
	}
}
