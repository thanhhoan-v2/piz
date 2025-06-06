import { prisma } from "@prisma/createClient"
import { type NextRequest, NextResponse } from "next/server"

// Define type for joined users
type JoinedUser = {
	id: string
	userName: string
}

export async function POST(req: NextRequest) {
	try {
		const { content, userId, sourceType, sourceId, snippetId } = await req.json()

		// Generate a 6-digit room ID
		const roomId = Math.floor(100000 + Math.random() * 900000).toString()

		// Create source metadata if provided
		let sourceMetadata = {}

		if (sourceType && (sourceId || snippetId)) {
			if (sourceType === "post" && sourceId) {
				sourceMetadata = { ...sourceMetadata, sourcePost: sourceId }
			}
			if (snippetId) {
				sourceMetadata = { ...sourceMetadata, sourceSnippet: snippetId }
			}
		}

		// Convert joined_users to proper JSON format
		const joinedUsers: JoinedUser[] = []

		// Create a new collab room
		const newRoom = await prisma.collab.create({
			data: {
				content: content || "",
				updated_at: new Date(),
				updated_by_userId: userId || null,
				version: "1.0.0",
				room_id: roomId,
				joined_users: joinedUsers,
				// We'll add metadata later when the column is available
			},
		})

		console.log("Created new collab room:", {
			id: newRoom.id.toString(),
			room_id: newRoom.room_id,
			sourceMetadata,
		})

		return NextResponse.json({
			success: true,
			room: {
				id: newRoom.id.toString(),
				roomId: newRoom.room_id,
				metadata: sourceMetadata,
			},
		})
	} catch (error) {
		console.error("Error creating collab room:", error)
		return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
	}
}
