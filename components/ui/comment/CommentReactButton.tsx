"use client"

import { Button } from "@components/atoms/button"
import { POST } from "@constants/query-key"
import { createPostReaction } from "@prisma/functions/post/reaction"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Heart } from "lucide-react"
import React from "react"

// Types for props passing to post item component
type PostReactButtonProps = {
	initialReactionCount: number
	isReacted: boolean
	userId?: string
	postId: number
	parentId: number
	className?: string
}

// Types for local state of post item
type PostReactButtonState = {
	reactionCount: number
	isReacted: boolean
}

export default function CommentReactButton({
	userId,
	postId,
	parentId,
	initialReactionCount,
	isReacted,
	className,
}: PostReactButtonProps) {
	const queryClient = useQueryClient()

	// Initialize local state for post item
	const initialState: PostReactButtonState = {
		reactionCount: initialReactionCount,
		isReacted: isReacted,
	}

	const [localState, setLocalState] =
		React.useState<PostReactButtonState>(initialState)

	const mutation = useMutation({
		mutationKey: [POST.REACTION, postId],
		mutationFn: () => createPostReaction({ userId, postId }),
		onMutate: async () => {
			// Cancel any outgoing refetches (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({ queryKey: [POST.SINGLE, postId] })

			// Snapshot the previous value
			const previousPost = queryClient.getQueryData([POST.SINGLE, postId])

			// Optimistically update to the new value
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

			// Return a context object with the snapshotted value
			return { previousPost }
		},
		onError: (err, variables, context) => {
			// Revert to the previous value
			if (context?.previousPost) {
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
			}
		},
		onSettled: () => {
			// Invalidate the query to ensure the data is up-to-date
			queryClient.invalidateQueries({ queryKey: [POST.SINGLE, postId] })
		},
	})

	const handleClick = () => {
		mutation.mutate()
	}

	return (
		<Button variant="ghost" className={className} onClick={handleClick}>
			<Heart fill={localState.isReacted ? "red" : "rgb(9,9,11)"} />
			<span>{localState.reactionCount}</span>
		</Button>
	)
}
