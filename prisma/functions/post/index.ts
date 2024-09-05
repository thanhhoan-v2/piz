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

// Get number of reactions, comments, shares
export const getPostCounts = async ({ postId }: { postId: number }) => {
	try {
		const noReactions = await prisma.postReaction.count({
			where: { postId: postId },
		})

		const noComments = await prisma.comment.count({
			where: { postId: postId },
		})

		const noShares = await prisma.share.count({
			where: { postId: postId },
		})

		return {
			noReactions: noReactions || 0,
			noComments: noComments || 0,
			noShares: noShares || 0,
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

// Get all posts
// TODO: Implement user recommended posts
export const getAllPosts = async () => {
	const posts = await prisma.post.findMany({
		orderBy: {
			createdAt: "desc", // Ascending order
		},
	})
	// revalidatePath("/")
	// return posts.map((post) => ({ ...post }))
	return posts
}

export const getPost = async (postId: number) => {
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
