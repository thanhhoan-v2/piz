"use server"
import type { PostSaveProps } from "@components/molecules/post/post-dropdown-menu"
import { prisma } from "@prisma/functions/client"

export const createSavedPost = async ({
	userId,
	postId,
}: PostSaveProps) => {
	try {
		const savedPost = await prisma.savedPost.create({
			data: { userId, postId },
		})
		console.log("[POST] Saved post:", savedPost)
	} catch (error) {
		console.error("[POST] Error saving:", error)
	}
}
