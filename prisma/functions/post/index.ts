"use server"

import type { $Enums } from "@prisma/client"
import { prisma } from "@prisma/functions/client"

type CreatePostProps = {
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
			const newPost = await prisma.post.create({
				data: {
					userId: userId,
					userName: userName,
					userAvatarUrl: userAvatarUrl,
					content: content,
					visibility: visibility,
				},
			})
			console.log("[POST] Created: ", newPost)
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

// TODO: Implement user recommended posts
// Get all posts
export const getAllPosts = async () => await prisma.post.findMany()
