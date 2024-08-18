"use server"
import { prisma } from "@prisma/functions/client"
import type { ReactionType } from "@prisma/global"

export type CreatePostReactionProps = {
	userId: string
	postId: number
	reactionType: ReactionType
}

export const createPostReaction = async ({
	userId,
	postId,
	reactionType,
}: CreatePostReactionProps) => {
	try {
		// Check if the user has already reacted to the post
		// SELECT * FROM post_reaction
		// WHERE userId = userId AND postId = postId
		const existingReaction = await prisma.postReaction.findFirst({
			where: {
				userId,
				postId,
			},
		})

		// If the user has already reacted to the post, update the reaction
		// UPDATE post_reaction SET reactionType
		if (existingReaction) {
			const updatedPostReaction = await prisma.postReaction.update({
				where: {
					id: existingReaction.id,
				},
				data: {
					reactionType,
				},
			})
			console.log("[POST_REACTION] Updated: ", updatedPostReaction)
		} else {
			// If the user has not reacted to the post
			// INSERT INTO post_reaction (userId, postId, reactionType)
			// VALUES (userId, postId, reactionType)
			const newPostReaction = await prisma.postReaction.create({
				data: {
					userId,
					postId,
					reactionType,
				},
			})
			console.log("[POST_REACTION] Created: ", newPostReaction)
		}
	} catch (error) {
		console.error("[POST_REACTION] Error creating: ", error)
	}
}
