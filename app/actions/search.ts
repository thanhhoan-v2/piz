"use server"
import { prisma } from "@prisma/createClient"

export async function searchUsers(query: string) {
    console.log("[SEARCH] Starting search with query:", query)

    if (!query) {
        console.log("[SEARCH] Empty query, returning empty array")
        return []
    }

    try {
        console.log("[SEARCH] Executing prisma query...")
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { id: { contains: query } },
                    { userName: { contains: query } },
                    { email: { contains: query } },
                ],
                isDeleted: false,
            },
            select: {
                id: true,
                userName: true,
                avatarUrl: true,
                email: true,
            },
            take: 10,
        })
        console.log("[SEARCH] Found users:", users.length)
        console.log("[SEARCH] Results:", JSON.stringify(users, null, 2))
        return users
    } catch (error) {
        console.error("[SEARCH] Error during search:", error)
        console.error("[SEARCH] Error details:", {
            query,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined
        })
        return []
    }
} 