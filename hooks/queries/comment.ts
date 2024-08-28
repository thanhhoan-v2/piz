import { prisma } from "@prisma/functions/client"

export const getPostComments = async ({ postId }: { postId: number }) => {
	await prisma.comment.findMany({
		where: { postId },
	})
}
