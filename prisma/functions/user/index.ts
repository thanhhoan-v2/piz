"use server"

import { prisma } from "@prisma/functions/client"

export const getUser = async (userName: string) => {
	try {
		const user = await prisma.appUser.findUnique({
			where: { userName: userName },
		})
		console.log("[USER] Found: ", user)
		return user
	} catch (error) {
		console.error("[USER] Error when fetching: ", error)
	}
}
