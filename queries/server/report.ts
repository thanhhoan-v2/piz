"use server"

import type { PostReportProps } from "@components/ui/post/PostDropdownMenu"
import { prisma } from "@prisma/createClient"

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
