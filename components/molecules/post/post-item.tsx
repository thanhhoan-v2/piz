"use client"
import { Button } from "@components/atoms/button"
import {
	type PostReactionActionProps,
	createPostReaction,
} from "@prisma/functions/post/reaction"
import { Forward, Heart, MessageSquare } from "lucide-react"
import React from "react"

// Types for props passing to post item component
export type PostItemProps = {
	key: string
	type: "reaction" | "comment" | "share"
	initialReactionCount: number
	initialCommentCount: number
	initialShareCount: number
	isReacted: boolean
}

// Types for local state of post item
type PostItemState = {
	reaction: number
	comment: number
	share: number
	isReacted: boolean
	showComment: boolean
}

export default function PostItem({
	key,
	type,
	userId,
	postId,
	initialReactionCount,
	initialCommentCount,
	initialShareCount,
	isReacted,
}: PostItemProps & PostReactionActionProps) {
	/*
	 * The useTransition hook is a part of React's concurrent features.
	 * It allows you to mark updates as "transitions," which means they can be interrupted by more urgent updates.
	 * This is particularly useful for improving the user experience by keeping the UI responsive during longer-running updates.
	 */
	const [isPending, startTransition] = React.useTransition()

	// Initialize local state for post item
	const initialState: PostItemState = {
		reaction: initialReactionCount,
		comment: initialCommentCount,
		share: initialShareCount,
		isReacted: isReacted,
		showComment: false,
	}

	const [localState, setLocalState] =
		React.useState<PostItemState>(initialState)

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

				if (type === "reaction") {
					if (prev.isReacted) {
						newState.reaction -= 1
						newState.isReacted = false
					} else {
						newState.reaction += 1
						newState.isReacted = true
					}
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
						if (type === "reaction") {
							if (prev.isReacted) {
								revertedState.reaction += 1
								revertedState.isReacted = true
							} else {
								revertedState.reaction -= 1
								revertedState.isReacted = false
							}
						}
						return revertedState
					})
				})
			})
		}, 300)

		if (type === "comment") {
			setLocalState((prev) => ({ ...prev, showComment: !prev.showComment }))
		}

		if (type === "share") {
		}
	}

	return (
		<>
			<div>

				{localState.showComment && (
					// help me
					<div className="mt-9 min-h-[100px] w-[100px] flex-center">
						comment
					</div>
				)}
			</div>
		</>
	)
}
