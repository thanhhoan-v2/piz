import type { Noti } from "@app/notification/page"
import type { SenderInfo } from "@components/ui/notification/NotificationItem"
import { formatDistanceToNow } from "date-fns"
import type { Route } from "next"

/**
 * Get the notification message based on the notification type
 */
export const getNotificationMessage = (notification: Noti, senderInfo?: SenderInfo) => {
	if (!senderInfo) return "Loading..."

	switch (notification.notificationType) {
		case "FOLLOW":
			return `${senderInfo.userName} started following you`
		case "COMMENT":
			return `${senderInfo.userName} commented on your post`
		case "COMMENT_REACTION":
			return `${senderInfo.userName} reacted to your comment`
		case "POST":
			return `${senderInfo.userName} created a new post`
		case "POST_REACTION":
			return `${senderInfo.userName} reacted to your post`
		case "TEAM_JOIN_REQUEST":
			return `${senderInfo.userName} wants to join your team`
		case "COLLAB_ROOM_JOINED":
			return `${senderInfo.userName} joined a collaboration room`
		case "COLLAB_ROOM_CREATED":
			return `${senderInfo.userName} created a new collaboration room`
		case "COLLAB_ROOM_INVITED":
			return `${senderInfo.userName} invited you to a collaboration room`
		case "TEAM_JOINED":
			return `${senderInfo.userName} joined your team`
		case "TEAM_CREATED":
			return `${senderInfo.userName} created a new team`
		case "TEAM_INVITED":
			return `${senderInfo.userName} invited you to join a team`
		default:
			return "New notification"
	}
}

/**
 * Get the notification link based on the notification type
 */
export const getNotificationLink = (notification: Noti): Route => {
	const senderIdRoute = `/${notification.senderId}` as Route
	const postIdRoute = notification.postId
		? (`/${notification.senderId}/post/${notification.postId}` as Route)
		: senderIdRoute
	const commentIdRoute = notification.commentId
		? (`${postIdRoute}/comment/${notification.commentId}` as Route)
		: postIdRoute
	const teamRoute = notification.teamId
		? (`/team/${notification.teamId}` as Route)
		: ("/team" as Route)
	const collabRoute = notification.roomId
		? (`/collab/${notification.roomId}` as Route)
		: ("/collab" as Route)

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
		case "TEAM_JOIN_REQUEST":
			return teamRoute
		case "TEAM_JOINED":
			return teamRoute
		case "TEAM_CREATED":
			return teamRoute
		case "TEAM_INVITED":
			return teamRoute
		case "COLLAB_ROOM_JOINED":
			return collabRoute
		case "COLLAB_ROOM_CREATED":
			return collabRoute
		case "COLLAB_ROOM_INVITED":
			return collabRoute
		default:
			return "/" as Route
	}
}

/**
 * Get the notification icon based on the notification type
 */
export const getNotificationIcon = (notification: Noti): string => {
	switch (notification.notificationType) {
		case "FOLLOW":
			return "user-plus"
		case "COMMENT":
			return "message-square"
		case "COMMENT_REACTION":
			return "heart"
		case "POST":
			return "file-text"
		case "POST_REACTION":
			return "heart"
		case "TEAM_JOIN_REQUEST":
			return "users"
		case "TEAM_JOINED":
			return "users"
		case "TEAM_CREATED":
			return "users"
		case "TEAM_INVITED":
			return "users"
		case "COLLAB_ROOM_JOINED":
			return "code"
		case "COLLAB_ROOM_CREATED":
			return "code"
		case "COLLAB_ROOM_INVITED":
			return "code"
		default:
			return "bell"
	}
}

/**
 * Format the notification time
 */
export const formatNotificationTime = (date: Date): string => {
	return formatDistanceToNow(new Date(date), { addSuffix: true })
}
