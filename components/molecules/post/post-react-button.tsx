"use client"

import { Button } from "@components/atoms/button"
import { createPostReaction } from "@prisma/functions/post/reaction"
import { Heart } from "lucide-react"
import React from "react"

// Types for props passing to post item component
type PostReactButtonProps = {
	initialReactionCount: number
	isReacted: boolean
	userId: string
	postId: number
	className?: string
}

// Types for local state of post item
type PostReactButtonState = {
	reactionCount: number
	isReacted: boolean
}

export default function PostReactButton({
	userId,
	postId,
	initialReactionCount,
	isReacted,
	className,
}: PostReactButtonProps) {
	/*
	 * The useTransition hook is a part of React's concurrent features.
	 * It allows you to mark updates as "transitions," which means they can be interrupted by more urgent updates.
	 * This is particularly useful for improving the user experience by keeping the UI responsive during longer-running updates.
	 */
	const [isPending, startTransition] = React.useTransition()

	// Initialize local state for post item
	const initialState: PostReactButtonState = {
		reactionCount: initialReactionCount,
		isReacted: isReacted,
	}

	const [localState, setLocalState] =
		React.useState<PostReactButtonState>(initialState)

	// Debounce the click handler
	let debounceTimeout: NodeJS.Timeout | null = null

	const handleClick = () => {
		// Prevent multiple rapid clicks from triggering multiple state updates and server calls
		// If there's an existing timeout (`debounceTimeout`), it clears it to reset the debounce timer
		if (debounceTimeout) {
			clearTimeout(debounceTimeout)
		}

		// Sets a new timeout that will execute the reaction logic after defined milliseconds
		debounceTimeout = setTimeout(() => {
			setLocalState((prev) => {
				const newState = { ...prev }

				if (prev.isReacted) {
					newState.reactionCount -= 1
					newState.isReacted = false
				} else {
					newState.reactionCount += 1
					newState.isReacted = true
				}

				return newState
			})

			// Use `startTransition` to prioritize the UI update over the server call
			startTransition(() => {
				// Create a post reaction on the server (or delete if existed one)
				createPostReaction({ userId, postId }).catch(() => {
					// Revert local state to its previous state if server call fails
					setLocalState((prev) => {
						const revertedState = { ...prev }
						if (prev.isReacted) {
							revertedState.reactionCount += 1
							revertedState.isReacted = true
						} else {
							revertedState.reactionCount -= 1
							revertedState.isReacted = false
						}
						return revertedState
					})
				})
			})
		}, 300)
	}

	return (
		<Button variant="ghost" className={className} onClick={handleClick}>
			<Heart fill={localState.isReacted ? "red" : "gray"} />
			<span>{localState.reactionCount}</span>
		</Button>
	)
}
