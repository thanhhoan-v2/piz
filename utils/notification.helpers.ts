import type { Noti } from "@app/notification/page"
import type { SenderInfo } from "@components/layout"
import type { Route } from "next"

export const getNotificationMessage = (notification: Noti, senderInfo?: SenderInfo) => {
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
		case "TEAM_JOIN_REQUEST":
			return `${senderInfo.userName} wants to join your team`
		default:
			return "New notification"
	}
}

export const getNotificationLink = (notification: Noti): Route => {
	const senderIdRoute = `/${notification.senderId}` as Route
	const postIdRoute = `${senderIdRoute}/post/${notification.postId}` as Route
	const commentIdRoute = `${postIdRoute}/comment/${notification.commentId}` as Route
	const teamRoute = `/team` as Route

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
		default:
			return "/" as Route
	}
}
