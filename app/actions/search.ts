"use server"
import { prisma } from "@prisma/createClient"

export async function searchUsers(query: string) {
	console.log("[SEARCH] Starting search with query:", query)

	if (!query || query.trim().length === 0) {
		console.log("[SEARCH] Empty query, returning empty array")
		return []
	}

	// Normalize the query: trim whitespace and convert to lowercase
	const normalizedQuery = query.trim().toLowerCase()

	try {
		console.log("[SEARCH] Executing prisma query...")
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
		console.log("[SEARCH] Found users:", users.length)
		console.log("[SEARCH] Results:", JSON.stringify(users, null, 2))
		return users
	} catch (error) {
		console.error("[SEARCH] Error during search:", error)
		console.error("[SEARCH] Error details:", {
			query,
			errorMessage: error instanceof Error ? error.message : String(error),
			errorStack: error instanceof Error ? error.stack : undefined,
		})
		return []
	}
}
