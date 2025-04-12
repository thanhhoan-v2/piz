import { stackServerApp } from "@/stack"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
	try {
		// Parse the request body to extract teamId and isPublic
		const { teamId, isPublic } = await request.json()

		// Check if teamId is provided, return an error if not
		if (!teamId) {
			return NextResponse.json({ error: "Team ID is required" }, { status: 400 })
		}

		// Fetch the team using the provided teamId
		const team = await stackServerApp.getTeam(teamId)

		// If team is not found, return a 404 error
		if (!team) {
			return NextResponse.json({ error: "Team not found" }, { status: 404 })
		}

		// Get existing metadata to preserve other fields like admins
		const existingMetadata = team.clientMetadata || {}

		// Update the team's client metadata to set the new public status while preserving other fields
		await team.update({
			clientMetadata: {
				...existingMetadata,
				isPublic: isPublic === true, // Ensure isPublic is explicitly set to a boolean
			},
		})

		// Return a success response with the new public status
		return NextResponse.json({ success: true, isPublic })
	} catch (error) {
		// Log the error and return a 500 error response
		console.error("Error updating team:", error)
		return NextResponse.json({ error: "Failed to update team" }, { status: 500 })
	}
}
