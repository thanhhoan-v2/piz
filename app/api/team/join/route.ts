import { stackServerApp } from "@/stack"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
	try {
		const { teamId, userId } = await request.json()

		if (!teamId || !userId) {
			return NextResponse.json({ error: "Team ID and User ID are required" }, { status: 400 })
		}

		// Get the team
		const team = await stackServerApp.getTeam(teamId)

		if (!team) {
			return NextResponse.json({ error: "Team not found" }, { status: 404 })
		}

		// Check if the team is public
		if (team.clientMetadata?.isPublic !== true) {
			return NextResponse.json({ error: "This team is not public" }, { status: 403 })
		}

		// Get the user
		const user = await stackServerApp.getUser(userId)

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 })
		}

		// Add the user to the team
		await team.addUser(userId)

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("Error joining team:", error)
		return NextResponse.json({ error: "Failed to join team" }, { status: 500 })
	}
}
