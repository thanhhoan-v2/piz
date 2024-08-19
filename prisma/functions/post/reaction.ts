"use server"

import { prisma } from "@prisma/functions/client"

export type PostReactionActionProps = {
	userId: string
	postId: number
}

// GET a post reaction by userId and postId
export const getPostReaction = async (userId: string, postId: number) => {
	return await prisma.postReaction.findFirst({
		where: { userId, postId },
	})
}

// CREATE a new post reaction or DELETE the existing one
export const createPostReaction = async ({
	userId,
	postId,
}: PostReactionActionProps) => {
	try {
		const existingReaction = await getPostReaction(userId, postId)

		if (existingReaction) {
			// If the user has already reacted to the post, delete the reaction
			await deletePostReaction({ userId, postId })
		} else {
			// If the user has not reacted to the post
			const newPostReaction = await prisma.postReaction.create({
				data: { userId, postId },
			})
			console.log("[POST_REACTION] Created: ", newPostReaction)
		}
	} catch (error) {
		console.error("[POST_REACTION] Error creating: ", error)
	}
}

// DELETE a post reaction
export const deletePostReaction = async ({
	userId,
	postId,
}: PostReactionActionProps) => {
	try {
		const existingReaction = await getPostReaction(userId, postId)

		// If the user has already reacted to the post, delete the reaction
		if (existingReaction) {
			const deletedPostReaction = await prisma.postReaction.delete({
				where: {
					id: existingReaction.id,
				},
			})
			console.log("[POST_REACTION] Deleted: ", deletedPostReaction)
		} else {
			console.log("[POST_REACTION] No existing reaction found to delete")
		}
	} catch (error) {
		console.error("[POST_REACTION] Error deleting: ", error)
		throw error // Rethrow the error to handle it in the component
	}
}
