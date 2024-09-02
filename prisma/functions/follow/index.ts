"use server"

import { prisma } from "@prisma/functions/client"
import { CreateNoti } from "@prisma/functions/noti"

/*
 * When A follow B, the request must be accepted by B.
 * Public profile can be viewed by anyone.
 * Private profile can only be viewed by (accepted) followers.
 */

export type CreateFollowProps = {
	followerId: string | null // User who follows
	followeeId: string | null // User who is followed
}

export const createFollow = async ({
	followerId,
	followeeId,
}: CreateFollowProps) => {
	try {
		if (followerId && followeeId) {
			// Get the followee's privacy mode
			const followee = await prisma.appUser.findUnique({
				where: { id: followeeId },
				select: { privacyMode: true },
			})

			if (!followee) {
				console.log("[FOLLOW] Followee not found")
				return
			}

			// Determine the request status based on the followee's privacy mode
			const requestStatus =
				followee.privacyMode === "PRIVATE" ? "PENDING" : "ACCEPTED"

			// Create the follow record with the appropriate request status
			const newFollow = await prisma.follow.create({
				data: {
					followerId: followerId,
					followeeId: followeeId,
					requestStatus: requestStatus,
				},
			})

			// Create a "follow" notification
			CreateNoti({
				senderId: followerId,
				receiverId: followeeId,
				notiType: "FOLLOW",
			})

			return newFollow
		}
		console.log("[FOLLOW] Missing followerId or followeeId when creating")
	} catch (error) {
		console.error("[FOLLOW] Error when creating: ", error)
	}
}

// Delete follow
export const deleteFollow = async ({
	followerId,
	followeeId,
}: CreateFollowProps) => {
	try {
		if (followerId && followeeId) {
			const deletedFollow = await prisma.follow.deleteMany({
				where: {
					followerId: followerId,
					followeeId: followeeId,
				},
			})
			return deletedFollow
		}
	} catch (error) {
		console.log(
			"[FOLLOW] Missing followerId or followeeId when deleting",
			error,
		)
	}
}

// Check if the follow relationship exists
export const checkIsFollowing = async ({
	followerId,
	followeeId,
}: CreateFollowProps) => {
	try {
		if (followerId && followeeId) {
			const existingFollow = await prisma.follow.findFirst({
				where: {
					followerId: followerId,
					followeeId: followeeId,
				},
			})
			return existingFollow
		}
		console.log("[FOLLOW] Missing followerId or followeeId when finding")
	} catch (error) {
		console.error("[FOLLOW] Error when finding: ", error)
	}
}
