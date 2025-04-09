import { stackServerApp } from "@/stack"
import { NextResponse } from "next/server"

export async function GET() {
	try {
		// Get all teams
		const allTeams = await stackServerApp.listTeams()

		// Filter for public teams
		const publicTeams = allTeams.filter((team) => team.clientMetadata?.isPublic === true)

		// Map to return only necessary data
		const formattedTeams = publicTeams.map((team) => ({
			id: team.id,
			displayName: team.displayName,
			profileImageUrl: team.profileImageUrl,
			createdAt: team.createdAt,
		}))

		return NextResponse.json(formattedTeams)
	} catch (error) {
		console.error("Error fetching public teams:", error)
		return NextResponse.json({ error: "Failed to fetch public teams" }, { status: 500 })
	}
}
