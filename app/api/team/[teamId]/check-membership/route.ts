import { stackServerApp } from "@/stack"
import { NextResponse } from "next/server"

export async function GET(_request: Request, context: { params: { teamId: string } }) {
	const { params } = context
	try {
		const teamId = params.teamId

		if (!teamId) {
			return NextResponse.json({ error: "Team ID is required" }, { status: 400 })
		}

		// Get the current user
		const currentUser = await stackServerApp.getCurrentUser()

		if (!currentUser) {
			return NextResponse.json({ isMember: false })
		}

		// Get the team
		const team = await stackServerApp.getTeam(teamId)

		if (!team) {
			return NextResponse.json({ error: "Team not found" }, { status: 404 })
		}

		// Check if the user is a member of the team using multiple methods
		try {
			// Method 1: Check if the user is in the team's user list
			const teamUsers = await team.getUsers()
			if (teamUsers?.some((user) => user.id === currentUser.id)) {
				console.log(`User ${currentUser.id} is a member of team ${teamId} (method 1)`)
				return NextResponse.json({ isMember: true })
			}

			// Method 2: Check if the user has any permissions in the team
			const hasPermission = await currentUser.hasPermission(team, "*")
			if (hasPermission) {
				console.log(`User ${currentUser.id} is a member of team ${teamId} (method 2)`)
				return NextResponse.json({ isMember: true })
			}

			// Method 3: Try to get the user's team profile
			try {
				const teamProfile = await currentUser.getTeamProfile(team)
				if (teamProfile) {
					console.log(`User ${currentUser.id} is a member of team ${teamId} (method 3)`)
					return NextResponse.json({ isMember: true })
				}
			} catch (_error) {
				console.log("Method 3 check failed, user likely not a member")
			}

			// If all checks fail, the user is not a member
			console.log(`User ${currentUser.id} is NOT a member of team ${teamId}`)
			return NextResponse.json({ isMember: false })
		} catch (error) {
			console.error("Error in membership checks:", error)
			// Default to false if checks fail
			return NextResponse.json({ isMember: false })
		}
	} catch (error) {
		console.error("Error checking team membership:", error)
		return NextResponse.json({ error: "Failed to check team membership" }, { status: 500 })
	}
}
