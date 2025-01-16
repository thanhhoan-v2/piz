"use server"

import type { PostReaction } from "@prisma/client"
import { prisma } from "@prisma/createClient"
import { createNotification } from "@queries/server/noti"

export type PostReactionProps = {
	userId?: string
	postId: string
}

export const getPostReaction = async ({
	userId,
	postId,
}: PostReactionProps) => {
	return await prisma.postReaction.findFirst({
		where: { userId, postId },
	})
}

// CREATE a new post reaction or DELETE the existing one
export const createPostReaction = async ({
	userId,
	postId,
}: PostReactionProps) => {
	try {
		if (!userId) {
			console.log("[POST_REACTION] Missing userId when creating reaction")
			return
		}

		const reaction = await prisma.postReaction.create({
			data: { userId, postId }
		})

		// Get post owner
		const post = await prisma.post.findUnique({
			where: { id: postId }
		})

		if (post && post.userId !== userId) {
			await createNotification({
				receiverId: post.userId,
				senderId: userId,
				type: "POST_REACTION",
				postId,
			})
		}

		return reaction
	} catch (error) {
		console.error("[POST_REACTION] Error creating: ", JSON.stringify(error, null, 2))
	}
}

// DELETE a post reaction
export const deletePostReaction = async ({
	userId,
	postId,
}: PostReactionProps) => {
	try {
		if (userId) {
			const existingReaction = await getPostReaction({ userId, postId })

			// If the user has already reacted to the post, delete the reaction
			if (existingReaction) {
				const deletedPostReaction: PostReaction =
					await prisma.postReaction.delete({
						where: {
							id: existingReaction.id,
						},
					})
				console.log("[POST_REACTION] Deleted: ", deletedPostReaction)
			} else {
				console.log("[POST_REACTION] No existing reaction found to delete")
			}
		} else {
			console.log("[POST_REACTION] User ID not found")
		}
	} catch (error) {
		console.error("[POST_REACTION] Error deleting: ", error)
		throw error // Rethrow the error to handle it in the component
	}
}
