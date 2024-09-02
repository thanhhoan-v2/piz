import type { $Enums } from "@prisma/client"
import { prisma } from "@prisma/functions/client"

export type NotiType = "FOLLOW" | "COMMENT" | "REPLY" | "MENTION"

type NotiProps = {
	senderId: string
	receiverId: string
	notiType: $Enums.NotificationType
}

export const CreateNoti = async ({
	senderId,
	receiverId,
	notiType,
}: NotiProps) => {
	try {
		const noti = await prisma.notification.create({
			data: {
				senderId: senderId,
				receiverId: receiverId,
				notificationType: notiType,
			},
		})
		console.log("Notification: ", noti)
	} catch (error) {
		console.error("[NOTI] Error when creating notification: ", error)
	}
}
