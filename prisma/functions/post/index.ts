"use server"

import type { $Enums } from "@prisma/client"
import { prisma } from "@prisma/functions/client"

export type CreatePostProps = {
	userId: string | null
	userName: string | null
	userAvatarUrl: string | null
	content: string
	visibility: $Enums.PostVisibility
}

// Create a post
export const createPost = async ({
	userId,
	userName,
	userAvatarUrl,
	content,
	visibility,
}: CreatePostProps) => {
	try {
		if (userId) {
			console.log("Creating post..")
			const newPost = await prisma.post.create({
				data: {
					userId: userId,
					userName: userName,
					userAvatarUrl: userAvatarUrl,
					content: content,
					visibility: visibility,
				},
			})
			console.log("Created post: ", newPost)
			return newPost
		}
		console.log("[POST] Missing userId when creating post")
	} catch (error) {
		console.error("[POST] Error when creating: ", error)
	}
}

// Get a post information (no of reactions, comments, shares)
export const getPostInfo = async (id: number) => {
	const noReactions = await prisma.postReaction.count({
		where: { postId: id },
	})

	const noComments = await prisma.comment.count({ where: { postId: id } })

	const noShares = await prisma.share.count({ where: { postId: id } })

	return {
		noReactions,
		noComments,
		noShares,
	}
}

// Get all posts
// TODO: Implement user recommended posts
export const getAllPosts = async () => {
	const posts = await prisma.post.findMany()
	// revalidatePath("/")
	return posts.map((post) => ({ ...post }))
}
