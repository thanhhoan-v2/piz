"use server"

import { prisma } from "@prisma/createClient"
import { createNotification } from "@queries/server/noti"

export async function getFollow({
	followerId,
	followeeId,
}: { followerId: string; followeeId: string }) {
	try {
		console.log(
			`[FOLLOW] Checking follow status: ${followerId} -> ${followeeId}`,
		)
		const follow = await prisma.follow.findFirst({
			where: { followerId, followeeId },
		})
		console.log("[FOLLOW] Status found:", follow)
		return follow
	} catch (error) {
		console.error(
			"[FOLLOW] Error checking follow status:",
			JSON.stringify(error, null, 2),
		)
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
		console.log("[FOLLOW] Created:", follow)

		// Create notification for the followee
		await createNotification({
			receiverId: followeeId,
			senderId: followerId,
			type: "FOLLOW",
		})

		return follow
	} catch (error) {
		console.error(
			"[FOLLOW] Error creating follow:",
			JSON.stringify(error, null, 2),
		)
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
		console.log("[FOLLOW] Deleted:", follow)
		return follow
	} catch (error) {
		console.error(
			"[FOLLOW] Error deleting follow:",
			JSON.stringify(error, null, 2),
		)
		throw error
	}
}

export async function getUserFollowers(userId: string) {
	try {
		console.log(`[FOLLOW] Getting followers for user: ${userId}`)
		
		// First, get all follows where this user is being followed
		const follows = await prisma.follow.findMany({
			where: { followeeId: userId }
		})

		// Get the follower IDs
		const followerIds = follows.map(follow => follow.followerId)
		
		if (followerIds.length === 0) {
			console.log('[FOLLOW] No followers found')
			return []
		}

		// Fetch the actual user details for each follower
		const followerUsers = await prisma.user.findMany({
			where: {
				id: { in: followerIds }
			},
			select: {
				id: true,
				userName: true,
				userAvatarUrl: true
			}
		})

		console.log(`[FOLLOW] Found ${followerUsers.length} followers`)
		
		// Transform the data to have consistent property names
		const serializedUsers = followerUsers.map(user => ({
			id: user.id,
			userName: user.userName || 'unknown',
			avatarUrl: user.userAvatarUrl
		}))
		
		return serializedUsers
	} catch (error) {
		console.error(
			"[FOLLOW] Error getting followers:",
			JSON.stringify(error, null, 2),
		)
		throw error
	}
}

export async function getUserFollowing(userId: string) {
	try {
		console.log(`[FOLLOW] Getting following for user: ${userId}`)
		
		// Get all follows where this user is following others
		const follows = await prisma.follow.findMany({
			where: { followerId: userId }
		})

		// Get the followee IDs (users being followed)
		const followeeIds = follows.map(follow => follow.followeeId)
		
		if (followeeIds.length === 0) {
			console.log('[FOLLOW] User is not following anyone')
			return []
		}

		// Fetch the actual user details for each followee
		const followingUsers = await prisma.user.findMany({
			where: {
				id: { in: followeeIds }
			},
			select: {
				id: true,
				userName: true,
				userAvatarUrl: true
			}
		})

		console.log(`[FOLLOW] User is following ${followingUsers.length} users`)
		
		// Transform the data to have consistent property names
		const serializedUsers = followingUsers.map(user => ({
			id: user.id,
			userName: user.userName || 'unknown',
			avatarUrl: user.userAvatarUrl
		}))
		
		return serializedUsers
	} catch (error) {
		console.error(
			"[FOLLOW] Error getting following users:",
			JSON.stringify(error, null, 2),
		)
		throw error
	}
}
