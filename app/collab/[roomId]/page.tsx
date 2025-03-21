"use client"
import { useUser } from "@stackframe/stack"
import { createSupabaseBrowserClient } from "@utils/supabase/client"
import { useCallback, useEffect, useRef, useState } from "react"
import { CollabUI } from "./components/CollabUI"
import type { PresenceState, PresenceUser } from "./components/CollabUI"

// Define the type for the payload
type Payload = {
	new: {
		updated_by_userId: string
		content: string
	}
}

export default function CollabPage({ params }: { params: Promise<{ roomId: string }> }) {
	const [roomId, setRoomId] = useState("")
	const [code, setCode] = useState("")
	const [users, setUsers] = useState<PresenceState>({})
	const [saveStatus, setSaveStatus] = useState<"saving" | "saved">("saved")
	const supabase = createSupabaseBrowserClient()
	const user = useUser()
	const userId = user?.id
	const userName = user?.displayName || "Anonymous"
	const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null) // Use useRef to hold the channel
	const presenceCheckIntervalRef = useRef<NodeJS.Timeout | null>(null) // Ref for the presence check interval
	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Ref for the save timeout
	const isRemoteChangeRef = useRef(false) // Track if change is from remote source
	// Store collabInfo to access the BigInt id for the chat
	const [collabInfo, setCollabInfo] = useState<{ id?: bigint; content?: string } | null>(null)

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
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		(channel: any) => {
			if (!userId || !channel) return

			channel
				.send({
					type: "broadcast",
					event: "presence_sync_request",
					payload: { userId, timestamp: Date.now() },
				})
				.catch((err: Error) => {
					console.error("Error broadcasting presence:", err)
				})
		},
		[userId],
	)

	// Update the subscription callback to use the defined type
	useEffect(() => {
		if (!roomId) return

		console.log("Setting up realtime subscription for code changes")

		// Get initial collab info to retrieve the BigInt id
		const fetchCollabInfo = async () => {
			try {
				const { data, error } = await supabase.from("Collab").select("*").eq("id", roomId).single()

				if (error) {
					console.error("Error fetching collab info:", error)
					return
				}

				console.log("Fetched collab info:", data)
				setCollabInfo(data)
				if (data?.content) {
					setCode(data.content)
				}
			} catch (err) {
				console.error("Failed to fetch collab info:", err)
			}
		}

		fetchCollabInfo()

		// Subscribe to changes on the Collab table
		const subscription = supabase
			.channel("table-db-changes")
			.on(
				"system",
				{
					event: "*", // Listen to all events
					schema: "public",
					table: "Collab",
					filter: `id=eq.${roomId}`,
				},
				(payload: { new: { updated_by_userId: string; content: string } }) => {
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

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!roomId || !userId) return

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
				.on(
					"presence",
					{ event: "join" },
					({ key, newPresences }: { key: string; newPresences: PresenceUser[] }) => {
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
					},
				)
				.on(
					"presence",
					{ event: "leave" },
					({ key, leftPresences }: { key: string; leftPresences: PresenceUser[] }) => {
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
							.catch((err: Error) => {
								console.error("Error sending leave broadcast:", err)
							})
					},
				)
				.on(
					"broadcast",
					{ event: "presence_sync_request" },
					({ payload }: { payload: { userId: string; timestamp: number } }) => {
						// When receiving a sync request, re-track our presence to make sure
						// everyone can see us
						if (payload.userId !== userId) {
							console.log("Received sync request from:", payload.userId)
							trackPresence(channel)
						}
					},
				)
				.on(
					"broadcast",
					{ event: "user_left" },
					({ payload }: { payload: { userId: string; timestamp: number } }) => {
						// Force a presence check when we receive a user_left broadcast
						console.log("User left notification received:", payload.userId)
						checkPresenceState()
					},
				)
				.on(
					"postgres_changes",
					{
						event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
						schema: "public",
						table: "Collab",
						filter: `id=eq.${roomId}`,
					},
					(payload: { new: { updated_by_userId: string; content: string } }) => {
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
						if (channelRef.current) {
							channelRef.current
								.untrack()
								.then(() => {
									channelRef.current?.unsubscribe()
									channelRef.current = null
								})
								.catch((err: Error) => {
									console.error("Error untracking:", err)
									channelRef.current?.unsubscribe()
									channelRef.current = null
								})
						}
					})
					.catch((err: Error) => {
						console.error("Error sending leave broadcast:", err)
						channelRef.current
							?.untrack()
							.then(() => {
								channelRef.current?.unsubscribe()
								channelRef.current = null
							})
							.catch(() => {
								try {
									channelRef.current?.unsubscribe()
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
		<CollabUI
			roomId={roomId}
			code={code}
			users={users}
			saveStatus={saveStatus}
			userId={userId}
			userName={userName}
			collabInfo={collabInfo}
			handleCodeChange={handleCodeChange}
		/>
	)
}
