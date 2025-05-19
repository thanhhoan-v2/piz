import { createNotification } from "@queries/server/noti"
import { prisma } from "@prisma/createClient"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { userId, roomId, inviterId, inviterName, roomName } = await req.json()

        console.log("Invite request received for:", {
            roomId,
            type: typeof roomId,
            userId,
            inviterId
        })

        if (!userId || !roomId || !inviterId) {
            return NextResponse.json(
                { error: "Missing required fields: userId, roomId, inviterId" },
                { status: 400 }
            )
        }

        // Check if user exists
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!userExists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Let's query for all collab rooms to see what's available
        const allRooms = await prisma.collab.findMany({
            take: 5,
            orderBy: {
                created_at: 'desc'
            }
        })

        console.log("Most recent 5 collab rooms:", allRooms.map(room => ({
            id: room.id.toString(),
            room_id: room.room_id,
            created_at: room.created_at
        })))

        // Check if room exists - first try with the roomId directly (might be numeric)
        let roomExists = null;

        try {
            // Try to convert to BigInt first (this is the primary key approach)
            const roomIdBigInt = BigInt(roomId);

            roomExists = await prisma.collab.findUnique({
                where: { id: roomIdBigInt },
            });

            console.log("Room lookup by BigInt ID result:", roomExists ? "Found" : "Not found")
        } catch (error) {
            console.log("Failed to convert roomId to BigInt, trying as string match with room_id");

            // If BigInt conversion fails, try looking up by room_id (string field)
            roomExists = await prisma.collab.findFirst({
                where: { room_id: roomId },
            });

            console.log("Room lookup by string room_id result:", roomExists ? "Found" : "Not found")
        }

        if (!roomExists) {
            // Try one more approach - exact string match
            try {
                const exactMatch = await prisma.collab.findFirst({
                    where: {
                        OR: [
                            { id: { equals: BigInt(roomId) } },
                            { room_id: roomId }
                        ]
                    }
                });

                if (exactMatch) {
                    roomExists = exactMatch;
                    console.log("Found room with exact match approach");
                } else {
                    console.log("No exact match found either");
                }
            } catch (error) {
                console.log("Error in exact match attempt:", error);
            }
        }

        if (!roomExists) {
            return NextResponse.json({
                error: "Collab room not found",
                details: `Unable to find room with ID: ${roomId}`,
                debugInfo: {
                    roomIdType: typeof roomId,
                    firstFewRooms: allRooms.length > 0 ? allRooms.slice(0, 3).map(r => ({ id: r.id.toString(), roomId: r.room_id })) : []
                }
            }, { status: 404 })
        }

        // Create a notification
        await createNotification({
            receiverId: userId,
            senderId: inviterId,
            type: "COLLAB_ROOM_INVITED",
            options: {
                roomId: roomExists.id.toString(), // Use the actual ID from the found room
                metadata: {
                    inviterName,
                    roomName: roomName || `Room ${roomId}`,
                },
            },
        })

        return NextResponse.json({
            success: true,
            roomInfo: {
                id: roomExists.id.toString(),
                room_id: roomExists.room_id
            }
        })
    } catch (error) {
        console.error("Error inviting user to collab room:", error)
        return NextResponse.json(
            { error: "Failed to send invitation" },
            { status: 500 }
        )
    }
} 