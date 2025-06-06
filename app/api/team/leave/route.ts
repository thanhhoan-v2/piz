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

		// Get the user
		const user = await stackServerApp.getUser(userId)

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 })
		}

		// Check if the user is a member of the team
		const teamUsers = await team.listUsers()
		const isTeamMember = teamUsers.some((teamUser) => teamUser.id === userId)

		if (!isTeamMember) {
			return NextResponse.json({ error: "User is not a member of this team" }, { status: 400 })
		}

		// Remove the user from the team
		// According to Stack Auth docs, we need to call leaveTeam on the user object
		try {
			// First, try passing the team object
			await user.leaveTeam(team)
		} catch (teamObjError) {
			console.error("Error leaving team with team object:", teamObjError)

			// If that fails, try passing just the team ID
			await user.leaveTeam(teamId)
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("Error leaving team:", error)

		// Return more detailed error information
		const errorMessage = error instanceof Error ? error.message : "Unknown error"
		console.error("Error details:", errorMessage)

		return NextResponse.json(
			{
				error: "Failed to leave team",
				details: errorMessage,
			},
			{ status: 500 }
		)
	}
}
