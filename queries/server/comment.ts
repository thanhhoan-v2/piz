"use server"

import type { CommentReaction } from "@prisma/client"
import { prisma } from "@prisma/createClient"
import { createNotification } from "@queries/server/noti"

export type CreateCommentProps = {
	id: string
	postId: string
	userId?: string
	userName?: string | null
	userAvatarUrl?: string | null
	content: string
	degree?: number
	parentId?: string
}

export const createComment = async (newComment: CreateCommentProps) => {
	try {
		if (!newComment.userId) {
			console.log("[COMMENT] Missing userId when creating comment")
			return
		}

		const comment = await prisma.comment.create({
			data: {
				id: newComment.id,
				userId: newComment.userId,
				postId: newComment.postId,
				content: newComment.content,
				parentId: newComment.parentId,
				degree: newComment.degree,
			},
		})

		// Get post owner
		const post = await prisma.post.findUnique({
			where: { id: newComment.postId }
		})

		if (post && post.userId !== newComment.userId) {
			try {
				await createNotification({
					receiverId: post.userId,
					senderId: newComment.userId,
					type: "COMMENT",
					options: {
						postId: newComment.postId,
						commentId: comment.id
					}
				})
			} catch (error) {
				console.error('[COMMENT] Error creating notification:', error)
			}
		}

		return comment
	} catch (error) {
		console.error(error)
	}
}

export const getComment = async (commentId: string) => {
	try {
		const comment = await prisma.comment.findUnique({
			where: {
				id: commentId,
			},
		})
		return comment
	} catch (error) {
		console.error(`<< Comment >> Error getting comment ${commentId}: `, error)
	}
}

export const getAllChildComments = async (parentId: string) => {
	try {
		const childComments = await prisma.comment.findMany({
			where: {
				parentId: parentId,
			},
		})
		return childComments
	} catch (error) {
		console.error("<< Comment >> Error getting all child comments: ", error)
	}
}

export const getCommentCounts = async ({
	commentId,
	parentId,
}: { commentId: string; parentId: string | null }) => {
	try {
		const noReactions = await prisma.commentReaction.count({
			where: { commentId: commentId },
		})

		let noComments = 0
		if (commentId !== parentId)
			noComments = await prisma.comment.count({
				where: { parentId: commentId },
			})

		// const noShares = await prisma.share.count({
		// 	where: { commentId: commentId },
		// })

		return {
			noReactions: noReactions || 0,
			noComments: noComments || 0,
			// noShares: noShares || 0,
		}
	} catch (error) {
		console.error("<< Comment >> Error fetching comment counts:", error)
		return {
			noReactions: 0,
			noComments: 0,
			// noShares: 0,
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
				// Get comment owner
				const comment = await prisma.comment.findUnique({
					where: { id: commentId }
				})

				if (comment && comment.userId !== userId) {
					await createNotification({
						receiverId: comment.userId,
						senderId: userId,
						type: "COMMENT_REACTION",
						options: {
							postId: comment.postId,
							commentId
						}
					})
				}
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
