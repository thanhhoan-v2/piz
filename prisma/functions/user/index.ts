"use server"

import { prisma } from "@prisma/functions/client"

export const getViewingUserInfo = async (userName: string) => {
	try {
		const user = await prisma.appUser.findUnique({
			where: { userName: userName },
		})
		return user
	} catch (error) {
		console.error("[USER] Error when fetching: ", error)
	}
}
