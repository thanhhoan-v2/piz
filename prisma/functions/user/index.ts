"use server"

import type { SearchResultProps } from "@components/molecules/search/search-list"
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

export const getRandomUserList = async (
	appUserId: string | null | undefined,
	no_users: number,
) => {
	try {
		if (appUserId !== null && appUserId !== undefined) {
			const randomUserList: SearchResultProps =
				await prisma.appUser.findManyRandom(no_users, {
					where: {
						NOT: {
							id: appUserId,
						},
					},
					select: {
						userName: true,
						fullName: true,
						avatarUrl: true,
					},
				})
			console.log("<< User >> Got random user list: \n", randomUserList)
			return randomUserList
		}
		console.log("<< User >> Missing appUserId in getting random user list")
	} catch (error) {
		console.error("< User >> Error getting random user list: \n", error)
	}
}
