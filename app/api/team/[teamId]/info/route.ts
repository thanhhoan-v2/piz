import { stackServerApp } from "@/stack"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { teamId: string } }) {
	try {
		const teamId = params.teamId

		if (!teamId) {
			return NextResponse.json({ error: "Team ID is required" }, { status: 400 })
		}

		// Get the team from Stack Auth
		const team = await stackServerApp.getTeam(teamId)

		if (!team) {
			return NextResponse.json({ error: "Team not found" }, { status: 404 })
		}

		// Check if the current user is a member of the team
		let isMember = false
		try {
			const currentUser = await stackServerApp.getUser()
			if (currentUser) {
				// Check if the user is in the team's user list
				const teamUsers = await team.listUsers()
				isMember = teamUsers?.some((user) => user.id === currentUser.id)
			}
		} catch (error) {
			console.error("Error checking team membership:", error)
			// If there's an error, we'll default to false
		}

		// Return the team information with membership status
		return NextResponse.json({
			id: team.id,
			displayName: team.displayName,
			profileImageUrl: team.profileImageUrl,
			isPublic: team.clientMetadata?.isPublic === true,
			isMember: isMember,
		})
	} catch (error) {
		console.error("Error fetching team info:", error)
		return NextResponse.json({ error: "Failed to fetch team information" }, { status: 500 })
	}
}
