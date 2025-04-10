import { stackServerApp } from "@/stack"
import { NextResponse } from "next/server"

export async function GET() {
	try {
		// Get the current user
		const currentUser = await stackServerApp.getCurrentUser()

		// Get all teams
		const allTeams = await stackServerApp.listTeams()

		// Filter for public teams
		const publicTeams = allTeams.filter((team) => team.clientMetadata?.isPublic === true)

		// Get the teams the current user is a member of
		const userTeams = currentUser ? await currentUser.getTeams() : []
		const userTeamIds = userTeams.map((team) => team.id)

		// Map to return only necessary data
		const formattedTeams = await Promise.all(
			publicTeams.map(async (team) => {
				// Check if the user is a member of this team
				const isUserMember = userTeamIds.includes(team.id)

				// Get member count
				let memberCount = 0
				try {
					const members = await team.getUsers()
					memberCount = members ? members.length : 0
				} catch (error) {
					console.error(`Error getting members for team ${team.id}:`, error)
				}

				return {
					id: team.id,
					displayName: team.displayName,
					profileImageUrl: team.profileImageUrl,
					createdAt: team.createdAt,
					isUserMember,
					memberCount,
				}
			}),
		)

		return NextResponse.json(formattedTeams)
	} catch (error) {
		console.error("Error fetching public teams:", error)
		return NextResponse.json({ error: "Failed to fetch public teams" }, { status: 500 })
	}
}
