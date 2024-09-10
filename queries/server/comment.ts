"use server"

import type { CommentReaction } from "@prisma/client"
import { prisma } from "@prisma/createClient"

export type CreateCommentProps = {
	id: string
	postId: string
	userId: string
	userName: string | null
	userAvatarUrl: string | null
	content: string
	degree?: number
	parentId?: string
}

export const createComment = async ({
	id,
	postId,
	parentId,
	userId,
	userName,
	userAvatarUrl,
	content,
	degree,
}: CreateCommentProps) => {
	try {
		if (parentId) {
			if (degree)
				return await prisma.comment.create({
					data: {
						id: id,
						userId: userId,
						userName: userName,
						userAvatarUrl: userAvatarUrl,
						postId: postId,
						content: content,
						parentId: parentId,
						degree: degree,
					},
				})
			return await prisma.comment.create({
				data: {
					id: id,
					userId: userId,
					userName: userName,
					userAvatarUrl: userAvatarUrl,
					postId: postId,
					parentId: parentId,
					content: content,
				},
			})
		}
		console.error("<< Comment >> Missing parentId when creating")
	} catch (error) {
		console.error("<< Comment >> Error creating:\n", error)
	}
}

export const getCommentCounts = async ({
	commentId,
	parentId,
}: { commentId: string; parentId: string }) => {
	try {
		const noReactions = await prisma.commentReaction.count({
			where: { commentId: commentId },
		})

		let noComments = 0
		if (commentId !== parentId)
			noComments = await prisma.comment.count({
				where: { parentId: commentId },
			})

		const noShares = await prisma.share.count({
			where: { commentId: commentId },
		})

		return {
			noReactions: noReactions || 0,
			noComments: noComments || 0,
			noShares: noShares || 0,
		}
	} catch (error) {
		console.error("<< Comment >> Error fetching comment counts:", error)
		return {
			noReactions: 0,
			noComments: 0,
			noShares: 0,
		}
	}
}

export const getCommentReaction = async ({
	userId,
	commentId,
}: { userId?: string; commentId: string }) => {
	try {
		if (userId) {
			const commentReaction = await prisma.commentReaction.findFirst({
				where: { userId, commentId },
			})
			return commentReaction
		}
		console.error("<< Comment >> Missing userId when getting comment reaction")
	} catch (error) {
		console.error("<< Comment >> Error fetching comment reaction: ", error)
	}
}

export const createCommentReaction = async ({
	userId,
	commentId,
}: { userId?: string; commentId: string }) => {
	try {
		if (userId) {
			const existingReaction = await getCommentReaction({ userId, commentId })

			if (existingReaction) {
				// If the user has already reacted to the post, delete the reaction
				await deleteCommentReaction({ userId, commentId })
			} else {
				// If the user has not reacted to the post
				const newCommentReaction = await prisma.commentReaction.create({
					data: { userId: userId, commentId },
				})
				return newCommentReaction
			}
		}
		console.log("<< Comment >> Missing userId when creating reaction")
	} catch (error) {
		console.error("<< Comment >> Error creating reaction: ", error)
	}
}

export const deleteCommentReaction = async ({
	userId,
	commentId,
}: { userId: string; commentId: string }) => {
	try {
		if (userId) {
			const existingReaction = await getCommentReaction({ userId, commentId })

			if (existingReaction) {
				const deletedCommentReaction: CommentReaction =
					await prisma.commentReaction.delete({
						where: {
							id: existingReaction.id,
						},
					})
				console.log("<< Comment >> Deleted reaction: ", deletedCommentReaction)
			} else {
				console.log("<< Comment >> No existing reaction found to delete")
			}
		} else {
			console.log("<< Comment >> User ID not found")
		}
	} catch (error) {
		console.error("<< Comment >> Error deleting: ", error)
		throw error
	}
}

export const getAllCommentsByPost = async ({ postId }: { postId: string }) => {
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
