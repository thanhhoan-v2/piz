import { stackServerApp } from "@/stack"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
	try {
		// Parse the request body to extract teamId and userId
		const { teamId, userId } = await request.json()

		// Check if teamId and userId are provided, return an error if not
		if (!teamId || !userId) {
			return NextResponse.json({ error: "Team ID and User ID are required" }, { status: 400 })
		}

		// Fetch the team using the provided teamId
		const team = await stackServerApp.getTeam(teamId)

		// If team is not found, return a 404 error
		if (!team) {
			return NextResponse.json({ error: "Team not found" }, { status: 404 })
		}

		// Get the user
		const user = await stackServerApp.getUser(userId)

		// If user is not found, return a 404 error
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 })
		}

		// Update the team's client metadata to set the creator as admin
		// Preserve any existing metadata
		const existingMetadata = team.clientMetadata || {}

		console.log("Setting team admin - Team ID:", teamId)
		console.log("Setting team admin - User ID:", userId)
		console.log(
			"Setting team admin - Existing Metadata:",
			JSON.stringify(existingMetadata, null, 2),
		)
		console.log("Setting team admin - Team object keys:", Object.keys(team))

		await team.update({
			clientMetadata: {
				...existingMetadata,
				admins: [userId], // Set the creator as the only admin initially
			},
		})

		// Get the updated team to verify the changes
		const updatedTeam = await stackServerApp.getTeam(teamId)
		console.log(
			"Setting team admin - Updated Metadata:",
			JSON.stringify(updatedTeam?.clientMetadata, null, 2),
		)

		// Return a success response
		return NextResponse.json({
			success: true,
			message: "Team created and user set as admin",
		})
	} catch (error) {
		// Log the error and return a 500 error response
		console.error("Error setting team admin:", error)
		return NextResponse.json({ error: "Failed to set team admin" }, { status: 500 })
	}
}
