"use server"

import { NotificationType } from "@prisma/client"
import { prisma } from "@prisma/createClient"

export async function getAllNotifications({ receiverId }: { receiverId: string }) {
	try {
		const notifications = await prisma.notification.findMany({
			where: { receiverId },
			orderBy: { createdAt: 'desc' },
		})
		return notifications
	} catch (error) {
		console.error('Error fetching notifications:', JSON.stringify(error, null, 2))
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
	postId?: string
	commentId?: string
}) {
	try {
		const notification = await prisma.notification.create({
			data: {
				receiverId,
				senderId,
				notificationType: type,
				postId,
				commentId,
			},
		})
		return notification
	} catch (error) {
		console.error('Error creating notification:', JSON.stringify(error, null, 2))
		return null
	}
}
