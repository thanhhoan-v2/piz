"use server"

import type { PostSaveProps } from "@components/ui/post/PostDropdownMenu"

export const createSavedPost = async ({ userId, postId }: PostSaveProps) => {
	// try {
	// 	const savedPost = await prisma.savedPost.create({
	// 		data: { id: generateBase64uuid(), userId, postId },
	// 	})
	// 	console.log("[POST] Saved post:", savedPost)
	// } catch (error) {
	// 	console.error("[POST] Error saving:", error)
	// }
}
