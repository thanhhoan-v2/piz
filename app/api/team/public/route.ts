import { stackServerApp } from "@/stack"
import { NextResponse } from "next/server"

export async function GET() {
	try {
		// Get the user
		const currentUser = await stackServerApp.getUser()

		// Get all teams
		const allTeams = await stackServerApp.listTeams()

		// Filter for public teams
		const publicTeams = allTeams.filter((team) => team.clientMetadata?.isPublic === true)

		// Get the teams the current user is a member of
		let userTeamIds: string[] = []
		if (currentUser) {
			// If we have a user, check which teams they're a member of
			userTeamIds = await Promise.all(
				publicTeams.map(async (team) => {
					try {
						// Try to get the user's team profile
						const teamProfile = await currentUser.getTeamProfile(team)
						return teamProfile ? team.id : null
					} catch (error) {
						console.error(`Error getting team profile for team ${team.id}:`, error)
						return null
					}
				}),
			).then((ids) => ids.filter((id): id is string => id !== null))
		}

		// Map to return only necessary data
		const formattedTeams = await Promise.all(
			publicTeams.map(async (team) => {
				// Check if the user is a member of this team
				const isUserMember = userTeamIds.includes(team.id)

				// Get member count
				let memberCount = 0
				try {
					const members = await team.listUsers()
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
