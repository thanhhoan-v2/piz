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

/**
 * Create a notification
 * @param receiverId - The ID of the user receiving the notification
 * @param senderId - The ID of the user sending the notification
 * @param type - The type of notification
 * @param options - Additional options for the notification
 * @returns The created notification or null if there was an error
 */
export async function createNotification({
	receiverId,
	senderId,
	type,
	options = {},
}: {
	receiverId: string
	senderId: string
	type: NotificationType
	options?: {
		postId?: string | null
		commentId?: string | null
		teamId?: string | null
		roomId?: string | null
		metadata?: Record<string, any>
	}
}) {
	// Don't create notification if sender is the same as receiver
	if (senderId === receiverId) return null

	try {
		const { postId, commentId, teamId, roomId, metadata } = options

		// Create the notification data object
		const notificationData: any = {
			receiverId,
			senderId,
			notificationType: type,
			postId,
			commentId,
			metadata: metadata ? metadata : undefined,
		}

		// Add teamId and roomId if provided
		if (teamId) notificationData.teamId = teamId
		if (roomId) notificationData.roomId = roomId

		const notification = await prisma.notification.create({
			data: notificationData,
		})

		// Revalidate the notification page to show the new notification
		revalidatePath("/notification")
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
