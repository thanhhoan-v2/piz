import { stackServerApp } from "@/stack"
import { NextResponse } from "next/server"

export async function GET(_request: Request, { params }: { params: Promise<{ teamId: string }> }) {
	try {
		const { teamId } = await params

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
		let isAdmin = false
		let currentUser = null

		try {
			currentUser = await stackServerApp.getUser()
			if (currentUser) {
				// Check if the user is in the team's user list
				const teamUsers = await team.listUsers()
				isMember = teamUsers?.some((user) => user.id === currentUser.id)

				// Check if the current user is an admin
				if (team.clientMetadata?.admins) {
					isAdmin =
						Array.isArray(team.clientMetadata.admins) &&
						team.clientMetadata.admins.includes(currentUser.id)
				}
			}
		} catch (error) {
			console.error("Error checking team membership:", error)
			// If there's an error, we'll default to false
		}

		// Return the team information with membership and admin status
		return NextResponse.json({
			id: team.id,
			displayName: team.displayName,
			profileImageUrl: team.profileImageUrl,
			isPublic: team.clientMetadata?.isPublic === true,
			isMember: isMember,
			isAdmin: isAdmin,
			admins: team.clientMetadata?.admins || [],
		})
	} catch (error) {
		console.error("Error fetching team info:", error)
		return NextResponse.json({ error: "Failed to fetch team information" }, { status: 500 })
	}
}
