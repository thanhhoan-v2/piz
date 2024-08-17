import { prisma } from "@prisma/functions/client"

// Get a post information (no of loves, hates, comments, shares)
export const getPostInfo = async (id: number) => {
	const noLoves = await prisma.postReaction.count({
		where: { postId: id, reactionType: "LOVE" },
	})

	const noHates = await prisma.postReaction.count({
		where: { postId: id, reactionType: "HATE" },
	})

	const noComments = await prisma.comment.count({
		where: { postId: id },
	})

	const noShares = await prisma.share.count({
		where: { postId: id },
	})

	return {
		noLoves,
		noHates,
		noComments,
		noShares,
	}
}

// TODO: Implement user recommended posts
// Get all posts
export const getAllPosts = async () => await prisma.post.findMany()
