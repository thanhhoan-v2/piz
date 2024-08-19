import { prisma } from "@prisma/functions/client"

// Get a post information (no of reactions, comments, shares)
export const getPostInfo = async (id: number) => {
	const noReactions = await prisma.postReaction.count({ where: { postId: id } })

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
