import { prisma } from "@prisma/createClient"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const query = searchParams.get("query")

	if (!query) {
		return NextResponse.json(
			{ error: "Query parameter is required" },
			{ status: 400 },
		)
	}

	try {
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
				userAvatarUrl: true,
				email: true,
			},
			take: 10,
		})

		return NextResponse.json(users)
	} catch (error) {
		console.error("Search error:", error)
		return NextResponse.json(
			{ error: "Failed to search users" },
			{ status: 500 },
		)
	}
}
