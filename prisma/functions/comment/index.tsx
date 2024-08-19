"use server"

import { prisma } from "@prisma/functions/client"

// Create a new comment for a post
export const createPostComment = async (
	postId: number,
	userId: string,
	content: string,
) => {
	try {
		const newPostComment = await prisma.comment.create({
			data: {
				userId: userId,
				postId: postId,
				content: content,
			},
		})
		console.log("[POST_COMMENT] Created: ", newPostComment)
	} catch (error) {
		console.error("[POST_COMMENT] Error: ", error)
	}
}
