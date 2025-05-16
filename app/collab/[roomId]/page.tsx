"use client"
import { useUser } from "@stackframe/stack"
import { createSupabaseBrowserClient } from "@utils/supabase/client"
import { useCallback, useEffect, useRef, useState } from "react"
import { CollabUI } from "./components/CollabUI"
import type { PresenceState, PresenceUser } from "./components/CollabUI"

// Define the type for code update payloads
type CodeUpdatePayload = {
	content: string
	userId: string
	userName: string
	timestamp: number
}

// Define the type for the payload
type Payload = {
	new: {
		updated_by_userId: string
		content: string
	}
}

// Define type for joined users
type JoinedUser = {
	id: string
	userName: string
}

// Custom hook for real-time code syncing similar to cursor tracking
const useRealtimeCode = (roomId: string, userId: string | undefined, userName: string) => {
	const [code, setCode] = useState("")
	const [saveStatus, setSaveStatus] = useState<"saving" | "saved">("saved")
	const supabase = createSupabaseBrowserClient()
	const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const lastSavedCodeRef = useRef<string>("")
	const isRemoteChangeRef = useRef(false)
	const CODE_UPDATE_EVENT = "realtime-code-update"
	const CODE_REQUEST_EVENT = "realtime-code-request"

	// Initialize channel for real-time code updates
	useEffect(() => {
		if (!roomId || !userId) return

		// Create a specific channel for code updates
		const channelName = `code-${roomId}`
		const channel = supabase.channel(channelName, {
			config: {
				broadcast: { self: false },
			},
		})
		channelRef.current = channel

		// Listen for code updates from other users
		channel
			.on("broadcast", { event: CODE_UPDATE_EVENT }, (data: { payload: CodeUpdatePayload }) => {
				// Don't process your own updates (although broadcast self is false)
				if (data.payload.userId === userId) return

				console.log("Received code update from:", data.payload.userName)

				// Set the flag to indicate this is a remote change
				isRemoteChangeRef.current = true

				// Update the local code state
				setCode(data.payload.content)
				setSaveStatus("saved")
			})
			.on("broadcast", { event: CODE_REQUEST_EVENT }, (data: { payload: { requesterId: string } }) => {
				// Another user is requesting the current code (they just joined)
				if (data.payload.requesterId !== userId && lastSavedCodeRef.current) {
					console.log("Sending current code to new user:", data.payload.requesterId)

					// Send current code to the requester
					channel.send({
						type: "broadcast",
						event: CODE_UPDATE_EVENT,
						payload: {
							content: lastSavedCodeRef.current,
							userId: userId,
							userName: userName,
							timestamp: Date.now(),
						},
					})
				}
			})
			.subscribe((status) => {
				console.log(`Code sync channel status: ${status}`)

				// When connected, request the latest code if we don't have it
				if (status === "SUBSCRIBED" && !lastSavedCodeRef.current) {
					channel.send({
						type: "broadcast",
						event: CODE_REQUEST_EVENT,
						payload: {
							requesterId: userId,
						},
					})
				}
			})

		// Cleanup function
		return () => {
			channel.unsubscribe()
		}
	}, [roomId, userId, userName, supabase])

	// Function to update the database (with debounce)
	const updateCodeInDatabase = useCallback(async (newCode: string) => {
		if (!roomId || !userId) return

		// Don't save if this is a remote change being applied
		if (isRemoteChangeRef.current) {
			console.log("Skipping database save for remote change")
			isRemoteChangeRef.current = false
			return
		}

		// Don't save if code hasn't changed
		if (newCode === lastSavedCodeRef.current) {
			console.log("Code hasn't changed, skipping database save")
			setSaveStatus("saved")
			return
		}

		console.log("Saving code to database:", newCode.length, "characters")
		setSaveStatus("saving")

		try {
			const { error } = await supabase
				.from("Collab")
				.update({
					content: newCode,
					updated_at: new Date().toISOString(),
					updated_by_userId: userId,
				})
				.eq("id", roomId)

			if (error) {
				console.error("Error updating code in database:", error)
			} else {
				console.log("Code saved successfully to database")
				lastSavedCodeRef.current = newCode
				setSaveStatus("saved")
			}
		} catch (err) {
			console.error("Failed to update code in database:", err)
		}
	}, [roomId, userId, supabase])

	// Function to broadcast code changes to other users
	const broadcastCodeChange = useCallback((newCode: string) => {
		if (!roomId || !userId || !channelRef.current) return

		// Don't broadcast if this is processing a remote change
		if (isRemoteChangeRef.current) return

		const payload: CodeUpdatePayload = {
			content: newCode,
			userId: userId,
			userName: userName,
			timestamp: Date.now(),
		}

		// Broadcast the code change to all users
		channelRef.current
			.send({
				type: "broadcast",
				event: CODE_UPDATE_EVENT,
				payload: payload,
			})
			.catch((error) => {
				console.error("Error broadcasting code update:", error)
			})
	}, [roomId, userId, userName])

	// Function to handle code changes from the editor
	const handleCodeChange = useCallback((value: string | undefined) => {
		if (value === undefined) return

		// Skip if this is a remote change being applied
		if (isRemoteChangeRef.current) {
			console.log("Processing remote code change")
			isRemoteChangeRef.current = false
			return
		}

		// Update local state immediately
		setCode(value)
		setSaveStatus("saving")

		// Broadcast change to other users immediately
		broadcastCodeChange(value)

		// Clear any existing timeout
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current)
		}

		// Debounce the database save
		saveTimeoutRef.current = setTimeout(() => {
			updateCodeInDatabase(value);
		}, 1000) // 1 second debounce for database updates
	}, [broadcastCodeChange, updateCodeInDatabase])

	// Fetch initial code from database
	const fetchInitialCode = useCallback(async () => {
		if (!roomId) return

		try {
			const { data, error } = await supabase
				.from("Collab")
				.select("content")
				.eq("id", roomId)
				.single()

			if (error) {
				console.error("Error fetching initial code:", error)
				return
			}

			if (data) {
				const content = data.content || ""
				setCode(content)
				lastSavedCodeRef.current = content
			}
		} catch (err) {
			console.error("Failed to fetch initial code:", err)
		}
	}, [roomId, supabase])

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current)
			}
		}
	}, [])

	return {
		code,
		setCode,
		saveStatus,
		handleCodeChange,
		fetchInitialCode,
	}
}

export default function CollabPage({ params }: { params: Promise<{ roomId: string }> }) {
	const [roomId, setRoomId] = useState("")
	const [users, setUsers] = useState<PresenceState>({})
	const supabase = createSupabaseBrowserClient()
	const user = useUser()
	const userId = user?.id
	const userName = user?.displayName || "Anonymous"
	const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null) // Use useRef to hold the channel
	const presenceCheckIntervalRef = useRef<NodeJS.Timeout | null>(null) // Ref for the presence check interval
	// Store collabInfo to access the BigInt id for the chat
	const [collabInfo, setCollabInfo] = useState<{ id?: bigint; content?: string } | null>(null)
	// Store joined users for tagging
	const [joinedUsers, setJoinedUsers] = useState<JoinedUser[]>([])

	// Use our new realtime code hook
	const { code, saveStatus, handleCodeChange, fetchInitialCode } = useRealtimeCode(
		roomId,
		userId,
		userName
	)

	useEffect(() => {
		const getRoomId = async () => {
			const { roomId } = await params
			setRoomId(roomId)
		}
		getRoomId()
	}, [params])

	// Function to check if user is already joined
	const isUserJoined = useCallback((userId: string) => {
		return joinedUsers.some(user => user.id === userId)
	}, [joinedUsers])

	// Function to add user to joined users and update database
	const addJoinedUser = useCallback(async (userId: string, userName: string) => {
		if (!roomId || !userId || isUserJoined(userId)) return

		const newUser = { id: userId, userName }
		setJoinedUsers(prev => [...prev, newUser])

		// Update joined_users in the database
		try {
			const { data, error } = await supabase
				.from("Collab")
				.select("joined_users")
				.eq("id", roomId)
				.single()

			if (error) {
				console.error("Error fetching joined users:", error)
				return
			}

			// Get current joined users or initialize empty array
			const currentJoinedUsers = data?.joined_users || []

			// Only add if user isn't already in the list
			if (!currentJoinedUsers.some((u: JoinedUser) => u.id === userId)) {
				const updatedJoinedUsers = [...currentJoinedUsers, newUser]

				// Update the database
				const { error: updateError } = await supabase
					.from("Collab")
					.update({ joined_users: updatedJoinedUsers })
					.eq("id", roomId)

				if (updateError) {
					console.error("Error updating joined users:", updateError)
				}
			}
		} catch (err) {
			console.error("Error in addJoinedUser:", err)
		}
	}, [roomId, supabase, isUserJoined])

	// Function to fetch joined users from database
	const fetchJoinedUsers = useCallback(async () => {
		if (!roomId) return

		try {
			const { data, error } = await supabase
				.from("Collab")
				.select("joined_users")
				.eq("id", roomId)
				.single()

			if (error) {
				console.error("Error fetching joined users:", error)
				return
			}

			if (data && data.joined_users) {
				setJoinedUsers(data.joined_users)
			} else {
				// Initialize with empty array if not yet set
				const { error: updateError } = await supabase
					.from("Collab")
					.update({ joined_users: [] })
					.eq("id", roomId)

				if (updateError) {
					console.error("Error initializing joined users:", updateError)
				}
			}
		} catch (err) {
			console.error("Error in fetchJoinedUsers:", err)
		}
	}, [roomId, supabase])

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

				// Process users and add to joined users list
				if (Object.keys(cleanedState).length > 0) {
					for (const key in cleanedState) {
						if (cleanedState[key]?.length > 0) {
							const presenceData = cleanedState[key][0]
							if (presenceData.userId && presenceData.userName) {
								addJoinedUser(presenceData.userId, presenceData.userName)
							}
						}
					}
				}
			} catch (err) {
				console.error("Error checking presence state:", err)
			}
		}
	}, [addJoinedUser])

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

	// useEffect to initialize room data when roomId is ready
	useEffect(() => {
		if (!roomId) return

		// Get collabInfo and initialize joined users
		const initializeRoom = async () => {
			try {
				const { data, error } = await supabase.from("Collab").select("*").eq("id", roomId).single()

				if (error) {
					console.error("Error fetching collab info:", error)
					return
				}

				console.log("Fetched collab info:", data)
				setCollabInfo(data)
			} catch (err) {
				console.error("Failed to fetch collab info:", err)
			}

			// Fetch joined users
			fetchJoinedUsers()

			// Fetch initial code
			fetchInitialCode()
		}

		initializeRoom()
	}, [roomId, supabase, fetchJoinedUsers, fetchInitialCode])

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

					// Check for new users to add to joined_users
					checkPresenceState()
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
						// We no longer need to handle code updates here
						// This is now handled by the useRealtimeCode hook
						console.log("Received database change notification - handled by realtime hook")
					},
				)
				.subscribe((status: string) => {
					console.log(`Room channel status: ${status}`)
				})

			// Track our initial presence
			await trackPresence(channel)

			// Alert other users that we're here
			await broadcastPresence(channel)

			// Set up regular heartbeat to keep our presence alive
			const heartbeat = setInterval(async () => {
				try {
					await trackPresence(channel)
				} catch (err) {
					console.error("Error in presence heartbeat:", err)
				}
			}, 30000) // 30 seconds

			// Set up function to clean up on unmount
			return () => {
				clearInterval(heartbeat)
				if (channel) {
					channel.unsubscribe()
				}
			}
		}

		// Fetch initial code
		const fetchCode = async () => {
			// We don't need this function anymore
			// Code fetching is now handled by useRealtimeCode hook
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
