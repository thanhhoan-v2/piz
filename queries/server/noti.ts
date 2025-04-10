"use server"

import type { NotificationType } from "@prisma/client"
import { prisma } from "@prisma/createClient"
import { revalidatePath } from "next/cache"

export async function getAllNotifications({ receiverId }: { receiverId: string }) {
	try {
		const notifications = await prisma.notification.findMany({
			where: { receiverId, isDeleted: false },
			orderBy: { createdAt: "desc" },
		})
		return notifications
	} catch (error) {
		console.error("Error fetching notifications:", JSON.stringify(error, null, 2))
		return []
	}
}

export async function createNotification({
	receiverId,
	senderId,
	type,
	postId,
	commentId,
}: {
	receiverId: string
	senderId: string
	type: NotificationType
	postId?: string | null
	commentId?: string | null
}) {
	// Don't create notification if sender is the same as receiver
	if (senderId === receiverId) return null

	try {
		const notification = await prisma.notification.create({
			data: {
				receiverId: receiverId,
				senderId: senderId,
				notificationType: type,
				postId: postId,
				commentId: commentId,
			},
		})
		return notification
	} catch (error) {
		console.error("Error creating notification:", JSON.stringify(error, null, 2))
		return null
	}
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead({
	notificationId,
}: {
	notificationId: string
}) {
	try {
		const notification = await prisma.notification.update({
			where: { id: notificationId },
			data: { isRead: true },
		})
		revalidatePath("/notification")
		return notification
	} catch (error) {
		console.error("Error marking notification as read:", JSON.stringify(error, null, 2))
		return null
	}
}

/**
 * Mark all notifications for a user as read
 */
export async function markAllNotificationsAsRead({
	userId,
}: {
	userId: string
}) {
	try {
		const result = await prisma.notification.updateMany({
			where: {
				receiverId: userId,
				isRead: false,
				isDeleted: false,
			},
			data: { isRead: true },
		})
		revalidatePath("/notification")
		return result
	} catch (error) {
		console.error("Error marking all notifications as read:", JSON.stringify(error, null, 2))
		return null
	}
}

/**
 * Delete a notification
 */
export async function deleteNotification({
	notificationId,
}: {
	notificationId: string
}) {
	try {
		const notification = await prisma.notification.update({
			where: { id: notificationId },
			data: { isDeleted: true },
		})
		revalidatePath("/notification")
		return notification
	} catch (error) {
		console.error("Error deleting notification:", JSON.stringify(error, null, 2))
		return null
	}
}
