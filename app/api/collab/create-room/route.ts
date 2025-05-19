import { prisma } from "@prisma/createClient"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { content, userId } = await req.json()

        // Generate a 6-digit room ID
        const roomId = Math.floor(100000 + Math.random() * 900000).toString()

        // Create a new collab room
        const newRoom = await prisma.collab.create({
            data: {
                content: content || "",
                updated_at: new Date(),
                updated_by_userId: userId || null,
                version: "1.0.0",
                room_id: roomId,
                joined_users: []
            }
        })

        console.log("Created new collab room:", {
            id: newRoom.id.toString(),
            room_id: newRoom.room_id
        })

        return NextResponse.json({
            success: true,
            room: {
                id: newRoom.id.toString(),
                roomId: newRoom.room_id
            }
        })
    } catch (error) {
        console.error("Error creating collab room:", error)
        return NextResponse.json(
            { error: "Failed to create room" },
            { status: 500 }
        )
    }
} 