"use server"

import { prisma } from "@prisma/createClient"
import { createNotification } from "@queries/server/noti"

export async function getFollow({
	followerId,
	followeeId,
}: { followerId: string; followeeId: string }) {
	try {
		console.log(`[FOLLOW] Checking follow status: ${followerId} -> ${followeeId}`)
		const follow = await prisma.follow.findFirst({
			where: { followerId, followeeId },
		})
		console.log('[FOLLOW] Status found:', follow)
		return follow
	} catch (error) {
		console.error('[FOLLOW] Error checking follow status:', JSON.stringify(error, null, 2))
		throw error
	}
}

export async function createFollow({
	followerId,
	followeeId,
}: { followerId: string; followeeId: string }) {
	try {
		console.log(`[FOLLOW] Creating follow: ${followerId} -> ${followeeId}`)
		const follow = await prisma.follow.create({
			data: { followerId, followeeId },
		})
		console.log('[FOLLOW] Created:', follow)

		// Create notification for the followee
		await createNotification({
			receiverId: followeeId,
			senderId: followerId,
			type: "FOLLOW",
		})

		return follow
	} catch (error) {
		console.error('[FOLLOW] Error creating follow:', JSON.stringify(error, null, 2))
		throw error
	}
}

export async function deleteFollow({
	followerId,
	followeeId,
}: { followerId: string; followeeId: string }) {
	try {
		console.log(`[FOLLOW] Deleting follow: ${followerId} -> ${followeeId}`)
		const follow = await prisma.follow.delete({
			where: {
				followerId_followeeId: {
					followerId,
					followeeId,
				},
			},
		})
		console.log('[FOLLOW] Deleted:', follow)
		return follow
	} catch (error) {
		console.error('[FOLLOW] Error deleting follow:', JSON.stringify(error, null, 2))
		throw error
	}
}
