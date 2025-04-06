"use server"
import { prisma } from "@prisma/createClient"
import { createNotification } from "@queries/server/noti"

export type CreatePostProps = {
	id: string
	userId?: string | null
	userName?: string | null
	userAvatarUrl?: string | null
	content: string
	createdAt: Date
	postImageUrl: string | null
	postVideoUrl: string | null
	snippetId: string | null
}

// export const createPost = async ({
// 	id,
// 	userId,
// 	userName,
// 	userAvatarUrl,
// 	content,
// 	visibility,
// }: CreatePostProps) => {
// 	try {
// 		if (userId) {
// 			const newPost = await prisma.post.create({
// 				data: {
// 					id: id,
// 					userId: userId,
// 					userName: userName,
// 					userAvatarUrl: userAvatarUrl,
// 					content: content,
// 					visibility: visibility,
// 			},
// 			})
// 			console.log("Created post: ", newPost)
// 			return newPost
// 		}
// 		console.log("[POST] Missing userId when creating post")
// 	} catch (error) {
// 		console.error("[POST] Error when creating: ", error)
// 	}
// }
export const createPost = async ({
	id,
	userId,
	userName,
	userAvatarUrl,
	content,
	postImageUrl,
	postVideoUrl,
	snippetId,
}: CreatePostProps) => {
	try {
		if (!userId) {
			console.log("[POST] Missing userId when creating post")
			return
		}

		// if (!id || !userId || !userName || !content) {
		// 	console.log("[POST] Missing required fields when creating post")
		// 	return
		// }

		const newPost = await prisma.post.create({
			data: {
				id: id,
				userId: userId,
				userName: userName,
				userAvatarUrl: userAvatarUrl ?? null,
				content: content,
				postImageUrl: postImageUrl,
				postVideoUrl: postVideoUrl,
				snippetId: snippetId,
			},
		})

		// Create notifications for all followers
		const followers = await prisma.follow.findMany({
			where: { followeeId: userId },
		})

		try {
			await Promise.all(
				followers.map((follower) =>
					createNotification({
						receiverId: follower.followerId,
						senderId: userId,
						type: "POST",
						postId: newPost.id,
					}),
				),
			)
		} catch (error) {
			console.error("[POST] Error creating notifications:", JSON.stringify(error, null, 2))
		}

		return newPost
	} catch (error) {
		console.error("[POST] Error when creating: ", JSON.stringify(error, null, 2))
	}
}

export const getPostCounts = async ({ postId }: { postId: string }) => {
	try {
		const noReactions = await prisma.postReaction.count({
			where: { postId: postId },
		})

		const noComments = await prisma.comment.count({
			where: { postId: postId },
		})

		return {
			noReactions: noReactions || 0,
			noComments: noComments || 0,
		}
	} catch (error) {
		console.error("Error fetching post counts:", error)
		return {
			noReactions: 0,
			noComments: 0,
			noShares: 0,
		}
	}
}

export const getAllPosts = async () => {
	const posts = await prisma.post.findMany({
		orderBy: {
			createdAt: "desc",
		},
	})
	return posts
}

export const getPost = async (postId: string) => {
	try {
		const post = await prisma.post.findUnique({
			where: {
				id: postId,
			},
		})
		return post
	} catch (error) {
		console.error(`<< Post >> Error getting post ${postId}: `, error)
	}
}

export const getAllUserPosts = async (userId: string) => {
	try {
		const posts = await prisma.post.findMany({
			where: { userId: userId },
		})
		console.log(`<< Post >> Got all posts of user ${userId}:\n`, posts)
		return posts
	} catch (error) {
		console.error(`<< Post >> Error getting posts of user ${userId}:\n`, error)
	}
}

// Delete a post by ID (only if the user is the author)
export const deletePost = async (postId: string, userId: string) => {
	try {
		// First verify that the user is the post author
		// const post = await prisma.post.findUnique({
		// 	where: { id: postId },
		// })

		// if (!postId) {
		// 	console.error(`<< Post >> Post ${postId} not found`)
		// 	return { success: false, message: "Post not found" }
		// }

		// Check if user is the author
		// if (post.userId !== userId) {
		// 	console.error(`<< Post >> User ${userId} is not the author of post ${postId}`)
		// 	return { success: false, message: "You are not authorized to delete this post" }
		// }

		// Delete related data (reactions, comments, etc.) if needed
		// await prisma.$transaction([
		// 	// Delete post reactions
		// 	prisma.postReaction.deleteMany({
		// 		where: { postId },
		// 	}),
		// 	// Delete comments
		// 	prisma.comment.deleteMany({
		// 		where: { postId },
		// 	}),
		// 	// Delete notifications related to the post
		// 	prisma.notification.deleteMany({
		// 		where: { postId },
		// 	}),
		// 	// Finally delete the post
		await prisma.post.delete({
			where: { id: postId },
		})
		// ])

		console.log(`<< Post >> Successfully deleted post ${postId}`)
		return { success: true, message: "Post deleted successfully" }
	} catch (error) {
		console.error(`<< Post >> Error deleting post ${postId}:`, error)
		return { success: false, message: "Error deleting post" }
	}
}
