"use server"

import { prisma } from "@prisma/functions/client"

type GetAllUserPostsProps = {
	userId: string
}

// Get all posts by a user
export const getAllUserPosts = async ({ userId }: GetAllUserPostsProps) => {
	try {
		const posts = await prisma.post.findMany({
			where: {
				userId: userId,
			},
		})
		return posts
	} catch (error) {
		console.error("Error getting all user posts", error)
	}
}
