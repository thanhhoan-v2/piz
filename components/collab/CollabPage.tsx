"use client"
import { createSupabaseBrowserClient } from "@/utils/supabase/client"
import { Badge } from "@components/ui/Badge"
import Editor from "@monaco-editor/react"
import { useUser } from "@stackframe/stack"
import { CheckCircle, Clock, UserIcon } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

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
	const [saveStatus, setSaveStatus] = useState<"saving" | "saved">("saved")
	const supabase = createSupabaseBrowserClient()
	const user = useUser()
	const userId = user?.id
	const userName = user?.displayName || "Anonymous"
	const channelRef = useRef<any>(null) // Use useRef to hold the channel
	const presenceCheckIntervalRef = useRef<NodeJS.Timeout | null>(null) // Ref for the presence check interval
	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Ref for the save timeout
	const isRemoteChangeRef = useRef(false) // Track if change is from remote source

	useEffect(() => {
		const getRoomId = async () => {
			const { roomId } = await params
			setRoomId(roomId)
		}
		getRoomId()
	}, [params])

	// Function to check and update presence state - memoized with useCallback
	const checkPresenceState = useCallback(() => {
		if (channelRef.current) {
			try {
				const state = channelRef.current.presenceState() as Record<string, PresenceUser[]>

				// Clean up any stale users (more than 15 seconds old)
				const cleanedState: PresenceState = {}
				const now = Date.now()

				Object.entries(state).forEach(([key, users]) => {
					// Filter out users with old timestamps
					const activeUsers = users.filter((user: PresenceUser) => {
						// Extract timestamp from presence_ref if it exists
						const timestampMatch = user.presence_ref?.match(/-(\d+)$/)
						if (!timestampMatch) return true // Keep if no timestamp

						const timestamp = Number.parseInt(timestampMatch[1], 10)
						const ageInSeconds = (now - timestamp) / 1000
						return ageInSeconds < 15 // Increased timeout to 15 seconds
					})

					if (activeUsers.length > 0) {
						cleanedState[key] = activeUsers
					}
				})

				setUsers(cleanedState)
				console.log("Checking presence state:", cleanedState)
			} catch (err) {
				console.error("Error checking presence state:", err)
			}
		}
	}, [])

	// Function to track presence with the current timestamp
	const trackPresence = useCallback(
		async (channel: any) => {
			if (!userId || !channel) return

			try {
				await channel.track({
					userId,
					userName,
					presence_ref: `${userId}-${Date.now()}`,
				})
				console.log("Tracked presence for:", userName)
			} catch (err) {
				console.error("Error tracking presence:", err)

				// Attempt to re-subscribe if tracking fails
				try {
					await channel.subscribe()
					await channel.track({
						userId,
						userName,
						presence_ref: `${userId}-${Date.now()}`,
					})
					console.log("Re-tracked presence after error")
				} catch (retryErr) {
					console.error("Failed to re-track presence:", retryErr)
				}
			}
		},
		[userId, userName],
	)

	// Function to broadcast presence to all users
	const broadcastPresence = useCallback(
		(channel: any) => {
			if (!userId || !channel) return

			channel
				.send({
					type: "broadcast",
					event: "presence_sync_request",
					payload: { userId, timestamp: Date.now() },
				})
				.catch((err: any) => {
					console.error("Error broadcasting presence:", err)
				})
		},
		[userId],
	)

	// Set up realtime subscription for code changes
	useEffect(() => {
		if (!roomId) return

		console.log("Setting up realtime subscription for code changes")

		// Subscribe to changes on the Collab table
		const subscription = supabase
			.channel("table-db-changes")
			.on(
				"postgres_changes",
				{
					event: "*", // Listen to all events
					schema: "public",
					table: "Collab",
					filter: `id=eq.${roomId}`,
				},
				(payload) => {
					console.log("Database change received:", payload)

					// Only update if the change was made by another user
					if (payload.new && payload.new.updated_by_userId !== userId) {
						console.log("Applying remote change from user:", payload.new.updated_by_userId)

						// Set flag to indicate this is a remote change
						isRemoteChangeRef.current = true

						// Update the code state
						setCode(payload.new.content || "")
					}
				},
			)
			.subscribe((status) => {
				console.log("Realtime subscription status:", status)
			})

		// Clean up subscription when component unmounts
		return () => {
			console.log("Cleaning up realtime subscription")
			subscription.unsubscribe()
		}
	}, [roomId, supabase, userId])

	useEffect(() => {
		if (!roomId || !userId) return

		let channel: any = null

		const setupChannel = async () => {
			// Create a new channel for this room
			channel = supabase.channel(`room:${roomId}`, {
				config: {
					presence: {
						key: userId,
					},
				},
			})

			// Set the channel ref
			channelRef.current = channel

			// Subscribe to presence events
			channel
				.on("presence", { event: "sync" }, () => {
					const state = channel.presenceState()
					console.log("Sync presence state:", state)
					setUsers(state as PresenceState)
				})
				.on("presence", { event: "join" }, ({ key, newPresences }) => {
					console.log("Join:", key, newPresences)
					// Update the state immediately when someone joins
					checkPresenceState()

					// Broadcast our presence to the new user
					if (key !== userId) {
						setTimeout(() => {
							trackPresence(channel)
							broadcastPresence(channel)
						}, 500)
					}
				})
				.on("presence", { event: "leave" }, ({ key, leftPresences }) => {
					console.log("Leave:", key, leftPresences)
					// Update the state immediately when someone leaves
					checkPresenceState()

					// Broadcast a leave notification to make sure everyone updates
					channel
						.send({
							type: "broadcast",
							event: "user_left",
							payload: { userId: key, timestamp: Date.now() },
						})
						.catch((err: any) => {
							console.error("Error sending leave broadcast:", err)
						})
				})
				.on("broadcast", { event: "presence_sync_request" }, ({ payload }) => {
					// When receiving a sync request, re-track our presence to make sure
					// everyone can see us
					if (payload.userId !== userId) {
						console.log("Received sync request from:", payload.userId)
						trackPresence(channel)
					}
				})
				.on("broadcast", { event: "user_left" }, ({ payload }) => {
					// Force a presence check when we receive a user_left broadcast
					console.log("User left notification received:", payload.userId)
					checkPresenceState()
				})
				.on(
					"postgres_changes",
					{
						event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
						schema: "public",
						table: "Collab",
						filter: `id=eq.${roomId}`,
					},
					(payload) => {
						// Only update if the change was made by another user
						if (payload.new && payload.new.updated_by_userId !== userId) {
							console.log("Received database change:", payload)
							// Use a ref to track if we're currently applying a remote change
							// to prevent feedback loops
							setCode(payload.new.content || "")
						}
					},
				)

			try {
				// Use a Promise with timeout to handle subscription
				const subscribeWithTimeout = async () => {
					return new Promise((resolve, reject) => {
						// Set a timeout to reject if subscription takes too long
						const timeoutId = setTimeout(() => {
							reject(new Error("Subscription timeout"))
						}, 5000)

						// Attempt to subscribe
						channel.subscribe((status: string) => {
							clearTimeout(timeoutId)
							if (status === "SUBSCRIBED") {
								resolve(status)
							} else {
								reject(new Error(`Failed to subscribe: ${status}`))
							}
						})
					})
				}

				try {
					await subscribeWithTimeout()
					console.log("Channel subscribed successfully")

					// Track the user's presence
					await trackPresence(channel)

					// Send an initial broadcast to notify others we're here
					broadcastPresence(channel)

					// Fetch initial code
					fetchCode()
				} catch (subscribeErr) {
					console.error("Subscription error:", subscribeErr)

					// Try a simpler subscription approach as fallback
					channel.subscribe(async (status: string) => {
						console.log("Fallback subscription status:", status)
						if (status === "SUBSCRIBED") {
							// Track the user's presence
							await trackPresence(channel)

							// Send an initial broadcast to notify others we're here
							broadcastPresence(channel)

							// Fetch initial code
							fetchCode()
						} else {
							console.error("Fallback subscription also failed:", status)
							// Retry setup after delay
							setTimeout(setupChannel, 3000)
						}
					})
				}
			} catch (err) {
				console.error("Error in subscription process:", err)
				// Retry subscription after a delay
				setTimeout(setupChannel, 3000)
			}
		}

		// Fetch initial code
		const fetchCode = async () => {
			try {
				const { data, error } = await supabase
					.from("Collab")
					.select("content")
					.eq("id", roomId)
					.single()

				if (error) {
					console.error("Error fetching code:", error)
					return
				}

				if (data) {
					setCode(data.content || "")
				}
			} catch (err) {
				console.error("Failed to fetch code:", err)
			}
		}

		// Initialize the channel
		setupChannel()

		// Heartbeat to keep presence alive - more frequent updates
		const presenceInterval = setInterval(async () => {
			if (channelRef.current) {
				try {
					await trackPresence(channelRef.current)
				} catch (err) {
					console.error("Error in presence heartbeat:", err)
					// If heartbeat fails, try to re-setup the channel
					if (channelRef.current) {
						try {
							await channelRef.current.unsubscribe()
						} catch (e) {
							console.error("Error unsubscribing from channel:", e)
						}
						setupChannel()
					}
				}
			}
		}, 3000) // More frequent heartbeat

		// Cleanup function
		return () => {
			clearInterval(presenceInterval)

			if (channelRef.current) {
				// Make sure to untrack before unsubscribing
				console.log("Cleaning up channel, untracking user:", userId)

				// Send a leave broadcast before untracking
				channelRef.current
					.send({
						type: "broadcast",
						event: "user_left",
						payload: { userId, timestamp: Date.now() },
					})
					.then(() => {
						// Untrack and then unsubscribe
						channelRef.current
							.untrack()
							.then(() => {
								channelRef.current.unsubscribe()
								channelRef.current = null
							})
							.catch((err: any) => {
								console.error("Error untracking:", err)
								channelRef.current.unsubscribe()
								channelRef.current = null
							})
					})
					.catch((err: any) => {
						console.error("Error sending leave broadcast:", err)
						channelRef.current
							.untrack()
							.then(() => {
								channelRef.current.unsubscribe()
								channelRef.current = null
							})
							.catch(() => {
								try {
									channelRef.current.unsubscribe()
								} catch (e) {
									console.error("Final unsubscribe error:", e)
								}
								channelRef.current = null
							})
					})
			}
		}
	}, [roomId, supabase, userId, userName, checkPresenceState, trackPresence, broadcastPresence])

	// Set up a separate interval to check presence every second
	useEffect(() => {
		if (!roomId) return

		// Clear any existing interval
		if (presenceCheckIntervalRef.current) {
			clearInterval(presenceCheckIntervalRef.current)
		}

		// Initial check
		checkPresenceState()

		// Set up a new interval to check presence every second
		presenceCheckIntervalRef.current = setInterval(() => {
			checkPresenceState()
		}, 1000)

		// Cleanup function
		return () => {
			if (presenceCheckIntervalRef.current) {
				clearInterval(presenceCheckIntervalRef.current)
				presenceCheckIntervalRef.current = null
			}
		}
	}, [roomId, checkPresenceState])

	const updateCodeInDatabase = async (newCode: string) => {
		try {
			// Don't save if this is a remote change being applied
			if (isRemoteChangeRef.current) {
				console.log("Skipping save for remote change")
				isRemoteChangeRef.current = false
				return
			}

			console.log("Saving code to database:", newCode.length, "characters")
			setSaveStatus("saving")

			const { error } = await supabase.from("Collab").upsert({
				id: roomId,
				content: newCode,
				updated_by_userId: userId,
			})

			if (error) {
				console.error("Error upserting code:", error)
			} else {
				console.log("Code saved successfully")
				setSaveStatus("saved")
			}
		} catch (err) {
			console.error("Failed to upsert code:", err)
		}
	}

	const handleCodeChange = (value: string | undefined) => {
		// Skip if this is a remote change being applied
		if (isRemoteChangeRef.current) {
			isRemoteChangeRef.current = false
			return
		}

		if (value !== undefined) {
			console.log("Local code change:", value.length, "characters")
			setCode(value)

			// Set status to saving
			setSaveStatus("saving")

			// Clear any existing timeout
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current)
			}

			// Debounce the save operation
			saveTimeoutRef.current = setTimeout(() => {
				updateCodeInDatabase(value)
			}, 500)
		}
	}

	// Cleanup save timeout on unmount
	useEffect(() => {
		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current)
			}
		}
	}, [])

	return (
		<div className="flex flex-col w-full h-screen">
			<div className="flex flex-col max-w-5xl mx-auto w-full h-full pt-10 px-4">
				{/* Header with room info */}
				<div className="mb-4">
					<h1 className="text-2xl font-bold text-white mb-1">Collaborative Editor</h1>
					<div className="flex items-center justify-between">
						<p className="text-gray-400 text-sm">Room ID: {roomId}</p>
						<div className="flex items-center">
							<Badge variant="secondary" className="bg-blue-900/30 text-blue-400 border-blue-800">
								<UserIcon size={14} className="mr-1.5" />
								<span>Logged in as: {userName}</span>
							</Badge>
						</div>
					</div>
				</div>

				{/* Main content area */}
				<div className="flex flex-col flex-grow bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-xl">
					{/* Top bar with users and status */}
					<div className="bg-gray-800 p-4 border-b border-gray-700">
						<div className="flex items-center justify-between">
							{/* Users section */}
							<div className="flex items-center gap-3">
								{/* Current user */}
								{/* <Badge variant="secondary" className="bg-blue-900/30 text-blue-400 border-blue-800">
									<UserIcon size={14} className="mr-1.5" />
									<span>You ({userName})</span>
								</Badge> */}

								{/* Other users */}
								{Object.values(users)
									.flat()
									.filter((user) => user.userId !== userId).length > 0 ? (
									Object.values(users)
										.flat()
										.filter((user) => user.userId !== userId)
										.map((user) => (
											<Badge
												key={user.presence_ref}
												variant="outline"
												className="bg-purple-900/20 text-purple-400 border-purple-800"
											>
												<UserIcon size={14} className="mr-1.5" />
												<span>{user.userName || "Anonymous"}</span>
											</Badge>
										))
								) : (
									<Badge variant="outline" className="bg-gray-800 text-gray-400 border-gray-700">
										<span>No one else is here</span>
									</Badge>
								)}
							</div>

							{/* Save status */}
							<div>
								{saveStatus === "saving" ? (
									<Badge
										variant="outline"
										className="bg-yellow-900/20 text-yellow-400 border-yellow-800"
									>
										<Clock size={14} className="mr-1.5 animate-pulse" />
										Saving...
									</Badge>
								) : (
									<Badge
										variant="outline"
										className="bg-green-900/20 text-green-400 border-green-800"
									>
										<CheckCircle size={14} className="mr-1.5" />
										Saved
									</Badge>
								)}
							</div>
						</div>
					</div>

					{/* Editor */}
					<div className="flex-grow">
						<Editor
							height="100%"
							defaultLanguage="typescript"
							value={code}
							onChange={handleCodeChange}
							options={{
								minimap: { enabled: false },
								fontSize: 14,
								lineHeight: 1.5,
								fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
								scrollBeyondLastLine: false,
								automaticLayout: true,
								padding: { top: 16 },
							}}
							theme="vs-dark"
							className="h-full"
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
