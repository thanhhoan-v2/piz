"use client"
import { createSupabaseBrowserClient } from "@/utils/supabase/client"
import Editor from "@monaco-editor/react"
import { useUser } from "@stackframe/stack"
import { useEffect, useState } from "react"

type PresenceUser = {
	userId: string
	userName: string
	presence_ref: string
}

type PresenceState = {
	[key: string]: PresenceUser[]
}

export default function Collab({ params }: { params: Promise<{ roomId: string }> }) {
	const [roomId, setRoomId] = useState("")
	const [code, setCode] = useState("")

	const [users, setUsers] = useState<PresenceState>({})
	const supabase = createSupabaseBrowserClient()

	const user = useUser()
	const userId = user?.id
	const userName = user?.displayName || "Anonymous"

	useEffect(() => {
		const getRoomId = async () => {
			const { roomId } = await params
			setRoomId(roomId)
		}
		getRoomId()
	}, [params])

	useEffect(() => {
		if (!roomId) return

		const channel = supabase
			.channel(`room:${roomId}`)
			.on("presence", { event: "sync" }, () => {
				const state = channel.presenceState<PresenceState>()
				setUsers(state)
				console.log("Presence state updated:", state)
			})
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "Collab",
					filter: `id=eq.${roomId}`,
				},
				(payload) => {
					if (payload.new.updated_by_userId !== userId) {
						setCode(payload.new.content)
					}
				},
			)
			.subscribe(async (status) => {
				if (status === "SUBSCRIBED") {
					console.log("Channel subscribed, tracking user:", userName)
					await channel.track({
						userId,
						userName,
					})
				}
			})

		return () => {
			channel.unsubscribe()
		}
	}, [roomId, supabase, userId, userName])

	const updateCodeInDatabase = async (newCode: string) => {
		try {
			const { error } = await supabase.from("Collab").upsert({
				id: roomId,
				content: newCode,
				updated_by_userId: userId,
			})

			if (error) {
				console.error("Error upserting code:", error)
			}
		} catch (err) {
			console.error("Failed to upsert code:", err)
		}
	}

	const handleCodeChange = (value: string | undefined) => {
		if (value) {
			setCode(value)
			updateCodeInDatabase(value)
		}
	}

	console.log(users)

	return (
		<div className="flex flex-col mt-[100px] w-[500px] h-screen">
			<div className="bg-black p-2">
				{/* Current user section */}
				<div className="flex items-center gap-2 mb-2 pb-2 border-gray-700 border-b">
					<div className="flex items-center gap-2">
						<span className="text-white">You ({userName})</span>
					</div>
				</div>

				{/* Other users section */}
				<div className="flex items-center gap-2">
					{Object.values(users)
						.flat()
						.filter((user) => user.userId !== userId)
						.map((user) => (
							<div key={user.presence_ref} className="flex items-center gap-2">
								<span className="text-white">{user.userName || "Anonymous"}</span>
							</div>
						))}
				</div>
			</div>
			<Editor
				height="60vh"
				defaultLanguage="typescript"
				value={code}
				onChange={handleCodeChange}
				options={{ minimap: { enabled: false } }}
			/>
		</div>
	)
}
