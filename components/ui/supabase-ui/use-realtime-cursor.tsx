import type { RealtimeChannel } from "@supabase/supabase-js"
import { createSupabaseBrowserClient } from "@utils/supabase/client"
import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Throttle a callback to a certain delay, It will only call the callback if the delay has passed, with the arguments
 * from the last call
 */
const useThrottleCallback = <Params extends unknown[], Return>(
	callback: (...args: Params) => Return,
	delay: number
) => {
	const lastCall = useRef(0)
	const timeout = useRef<NodeJS.Timeout | null>(null)

	return useCallback(
		(...args: Params) => {
			const now = Date.now()
			const remainingTime = delay - (now - lastCall.current)

			if (remainingTime <= 0) {
				if (timeout.current) {
					clearTimeout(timeout.current)
					timeout.current = null
				}
				lastCall.current = now
				callback(...args)
			} else if (!timeout.current) {
				timeout.current = setTimeout(() => {
					lastCall.current = Date.now()
					timeout.current = null
					callback(...args)
				}, remainingTime)
			}
		},
		[callback, delay]
	)
}

const supabase = createSupabaseBrowserClient()

const generateRandomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`

const generateRandomNumber = () => Math.floor(Math.random() * 100)

const EVENT_NAME = "realtime-cursor-move"

type CursorEventPayload = {
	position: {
		x: number
		y: number
	}
	user: {
		id: number
		name: string
	}
	color: string
	timestamp: number
}

export const useRealtimeCursors = ({
	roomName,
	username,
	throttleMs,
}: {
	roomName: string
	username: string
	throttleMs: number
}) => {
	const [color] = useState(generateRandomColor())
	const [userId] = useState(generateRandomNumber())
	const [cursors, setCursors] = useState<Record<string, CursorEventPayload>>({})
	// Reference to track if the mouse is within the editor
	const isWithinEditorRef = useRef(false)
	// Reference to store editor element bounds
	const editorBoundsRef = useRef<DOMRect | null>(null)

	const channelRef = useRef<RealtimeChannel | null>(null)

	const callback = useCallback(
		(event: MouseEvent) => {
			const { clientX, clientY } = event

			// Only send cursor updates when within the editor
			if (!isWithinEditorRef.current) return

			const payload: CursorEventPayload = {
				position: {
					x: clientX,
					y: clientY,
				},
				user: {
					id: userId,
					name: username,
				},
				color: color,
				timestamp: new Date().getTime(),
			}

			// Fix for 422 error - Use proper broadcast format
			if (channelRef.current) {
				channelRef.current
					.send({
						type: "broadcast",
						event: EVENT_NAME,
						payload: payload,
					})
					.then(() => {
						// Success - optional debug
						// console.log('Cursor data sent successfully')
					})
					.catch((error) => {
						console.error("Error sending cursor data:", error)
					})
			}
		},
		[color, userId, username]
	)

	const handleMouseMove = useThrottleCallback(callback, throttleMs)

	useEffect(() => {
		// Use a more specific channel name with a prefix
		const channelName = `cursor-${roomName}`
		const channel = supabase.channel(channelName, {
			config: {
				broadcast: { self: false },
				presence: { key: username },
			},
		})
		channelRef.current = channel

		channel
			.on("broadcast", { event: EVENT_NAME }, (data: { payload: CursorEventPayload }) => {
				const { user } = data.payload
				// Don't render your own cursor
				if (user.id === userId) return

				setCursors((prev) => {
					// if (prev[userId]) {
					// 	delete prev[userId]
					// }

					return {
						...prev,
						[user.id]: data.payload,
					}
				})
			})
			.subscribe()

		return () => {
			channel.unsubscribe()
		}
	}, [roomName, username, userId])

	// Setup event listeners for the editor element
	useEffect(() => {
		// Find the editor element - it's inside the Monaco editor container
		const setupEditorListeners = () => {
			// Find Monaco editor - it has class containing 'monaco-editor'
			const editorElements = document.querySelectorAll('[class*="monaco-editor"]')
			if (editorElements.length === 0) {
				// Try again if editor isn't loaded yet
				setTimeout(setupEditorListeners, 500)
				return
			}

			const editorElement = editorElements[0] as HTMLElement

			// Store editor bounds and update them on window resize
			const updateEditorBounds = () => {
				editorBoundsRef.current = editorElement.getBoundingClientRect()
			}

			// Initial bounds calculation
			updateEditorBounds()

			// Setup event listeners for the editor element
			editorElement.addEventListener("mouseenter", () => {
				isWithinEditorRef.current = true
			})

			editorElement.addEventListener("mouseleave", () => {
				isWithinEditorRef.current = false
			})

			// Listen for resize to update editor bounds
			window.addEventListener("resize", updateEditorBounds)

			// Return cleanup function
			return () => {
				editorElement.removeEventListener("mouseenter", () => {
					isWithinEditorRef.current = true
				})

				editorElement.removeEventListener("mouseleave", () => {
					isWithinEditorRef.current = false
				})

				window.removeEventListener("resize", updateEditorBounds)
			}
		}

		// Setup initial listeners with a delay to ensure editor is loaded
		const cleanupFn = setupEditorListeners()

		// Add global mouse move listener
		window.addEventListener("mousemove", handleMouseMove)

		// Cleanup on unmount
		return () => {
			window.removeEventListener("mousemove", handleMouseMove)
			if (cleanupFn) cleanupFn()
		}
	}, [handleMouseMove])

	return { cursors }
}
