"use server"

import type { $Enums } from "@prisma/client"
import { prisma } from "@prisma/functions/client"

export type NotiType = "FOLLOW" | "COMMENT" | "REPLY" | "MENTION"

type NotiProps = {
	senderId?: string | null
	receiverId?: string | null
	notiType?: $Enums.NotificationType
}

export const createNotification = async ({
	senderId,
	receiverId,
	notiType,
}: NotiProps) => {
	try {
		if (senderId) {
			const sender = await prisma.appUser.findUnique({
				where: { id: senderId },
				select: {
					userName: true,
					avatarUrl: true,
				},
			})

			if (!sender) {
				throw new Error(
					`<< Noti >> Error getting userName and avatarUrl for senderId: ${senderId}.`,
				)
			}

			if (receiverId) {
				const noti = await prisma.notification.create({
					data: {
						senderId: senderId,
						receiverId: receiverId,
						notificationType: notiType,
						senderUserName: sender.userName,
						senderAvatarUrl: sender.avatarUrl,
					},
				})
				console.log("Notification: ", noti)
			} else {
				console.error("<< Noti >> Missing receiverId when creating")
			}
		} else {
			console.error("<< Noti >> Missing senderId when creating")
		}
	} catch (error) {
		console.error("[NOTI] Error when creating notification: ", error)
	}
}

export const getAllNotifications = async ({ receiverId }: NotiProps) => {
	try {
		if (receiverId) {
			console.log(`Getting all notifications for user ${receiverId} ...`)
			const notis = await prisma.notification.findMany({
				where: {
					receiverId: receiverId,
				},
			})
			console.log(`Got all notifications for user ${receiverId}:\n${notis}`)
			return notis
		}
		console.error("<< Noti >> Missing receiverId when getting")
	} catch (error) {
		console.error("[NOTI] Error getting all notification: ", error)
	}
}
