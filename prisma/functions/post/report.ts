"use server"

import type { PostReportProps } from "@components/molecules/post/post-dropdown-menu"
import { prisma } from "@prisma/functions/client"

export const createReportedPost = async ({
	userId,
	postId,
	content,
}: PostReportProps) => {
	try {
		const reportedPost = await prisma.reportPost.create({
			data: { userId, postId, content },
		})
		console.log("[POST] Reported post:", reportedPost)
	} catch (error) {
		console.error("[POST] Error reporting:", error)
	}
}
