"use server"
import { prisma } from "@prisma/createClient"

export async function searchUsers(query: string) {
	if (!query || query.trim().length === 0) {
		return []
	}

	const normalizedQuery = query.trim().toLowerCase()

	try {
		const users = await prisma.user.findMany({
			where: {
				OR: [
					{ userName: { contains: normalizedQuery, mode: "insensitive" } },
					{ email: { contains: normalizedQuery, mode: "insensitive" } },
				],
				isDeleted: false,
			},
			select: {
				id: true,
				userName: true,
				userAvatarUrl: true,
				email: true,
			},
			take: 10,
			orderBy: {
				userName: "asc",
			},
		})
		return users
	} catch (error) {
		console.error("[SEARCH] Error details:", {
			query,
			errorMessage: error instanceof Error ? error.message : String(error),
			errorStack: error instanceof Error ? error.stack : undefined,
		})
		return []
	}
}
