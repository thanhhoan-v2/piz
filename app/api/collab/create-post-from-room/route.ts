import { createPost } from "@queries/server/post"
import { createSnippet } from "@queries/server/snippet"
import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

// Server-compatible UUID generator
function generateServerId() {
	return uuidv4().replace(/-/g, "")
}

export async function POST(req: NextRequest) {
	try {
		const {
			code,
			userId,
			userName,
			userAvatarUrl,
			roomId,
			roomDisplayId,
			language = "typescript",
		} = await req.json()

		if (!code || !userId) {
			return NextResponse.json({ error: "Missing required fields: code, userId" }, { status: 400 })
		}

		// 1. Create a new snippet with the code
		const snippetId = generateServerId()
		const snippet = await createSnippet({
			id: snippetId,
			userId,
			value: code,
			lang: language,
		})

		if (!snippet) {
			return NextResponse.json({ error: "Failed to create snippet" }, { status: 500 })
		}

		// 2. Create a post with the snippet
		const postId = generateServerId()
		// Create content with badge indicating it's an enhanced version
		const content = `✨ Enhanced code from collaboration room #${roomDisplayId || roomId}`

		const post = await createPost({
			id: postId,
			userId,
			userName,
			userAvatarUrl,
			content,
			postImageUrl: null,
			postVideoUrl: null,
			snippetId,
			teamId: null,
			createdAt: new Date(),
		})

		if (!post) {
			return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
		}

		return NextResponse.json({
			success: true,
			post: {
				id: postId,
				snippetId,
			},
		})
	} catch (error) {
		console.error("Error creating post from room:", error)
		return NextResponse.json({ error: "Failed to create post from room" }, { status: 500 })
	}
}
