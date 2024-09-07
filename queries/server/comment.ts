"use server"

import { prisma } from "@prisma/createClient"

export const createPostComment = async (
	postId: string,
	userId: string,
	userName: string,
	userAvatarUrl: string | null,
	content: string,
) => {
	try {
		const newPostComment = await prisma.comment.create({
			data: {
				userId: userId,
				userName: userName,
				userAvatarUrl: userAvatarUrl,
				postId: postId,
				content: content,
			},
		})
		console.log("[POST_COMMENT] Created: ", newPostComment)
	} catch (error) {
		console.error("[POST_COMMENT] Error: ", error)
	}
}

export const getPostComments = async ({ postId }: { postId: string }) => {
	try {
		const postComments = await prisma.comment.findMany({
			where: {
				postId: postId,
			},
		})
		return postComments
	} catch (error) {
		console.error("[POST_COMMENT] Error: ", error)
	}
}
