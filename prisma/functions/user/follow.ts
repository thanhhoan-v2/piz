"use server"

import { prisma } from "@prisma/functions/client"

type UserFollowerProps = {
	userId: string
}

// Get all user's followers
export const getAllFollowers = async ({ userId }: UserFollowerProps) => {
	try {
		const followers = await prisma.follow.findMany({
			where: {
				followeeId: userId,
			},
		})
		return followers
	} catch (error) {
		console.error("Error getting all user's followers", error)
	}
}

// Get the avatar URLs of the first three followers of a user
export const getFirstThreeFollowerAvatarUrls = async ({
	userId,
}: UserFollowerProps) => {
	try {
		const followers = await prisma.follow.findMany({
			where: {
				followeeId: userId,
			},
			select: {
				follower: {
					select: {
						fullName: true,
						avatarUrl: true,
					},
				},
			},
			take: 3,
		})
		return followers.map((follower) => ({
			name: follower?.follower?.fullName ?? "unknown",
			image: follower?.follower?.avatarUrl ?? "https://via.placeholder.com/150",
		}))
	} catch (error) {
		console.error("Error getting three user follower avatar URLs", error)
	}
}

// Count the number of followers a user has
export const countUserFollowers = async ({ userId }: UserFollowerProps) => {
	try {
		const count = await prisma.follow.count({ where: { followeeId: userId } })
		return count
	} catch (error) {
		console.error("Error counting user's followers", error)
	}
}
