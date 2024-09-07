"use client"

import { Button } from "@components/ui/Button"
import { createPostReaction } from "@queries/server/postReaction"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@utils/cn"
import { queryKey } from "@utils/queryKeyFactory"
import { Heart } from "lucide-react"
import React from "react"

// Types for props passing to post item component
type PostReactButtonProps = {
	initialReactionCount: number
	isReacted: boolean
	userId?: string
	postId: string
	className?: string
	wrapperClassName?: string
}

// Types for local state of post item
type PostReactButtonState = {
	reactionCount: number
	isReacted: boolean
}

type PostCounts = {
	noReactions: number
	noShares: number
	noComments: number
}

export default function PostReactButton({
	userId,
	postId,
	initialReactionCount,
	isReacted,
	className,
	wrapperClassName,
}: PostReactButtonProps) {
	const [localIsReacted, setReactionStatus] = React.useState(isReacted)

	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationKey: queryKey.post.selectReactionByUser({ userId, postId }),
		mutationFn: () => createPostReaction({ userId, postId }),
		onMutate: async () => {
			// Cancel any outgoing refetches (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey: queryKey.post.selectId(postId),
			})

			// Snapshot the previous value
			const previousPost = queryClient.getQueryData(
				queryKey.post.selectId(postId),
			)

			queryClient.setQueryData(
				queryKey.post.selectCount(postId),
				(prev: PostCounts) => ({
					...prev,
					noReactions: localIsReacted
						? prev.noReactions - 1
						: prev.noReactions + 1,
				}),
			)

			return { previousPost }
		},
		onSettled: () => {
			// Refetch the latest data from the server
			queryClient.invalidateQueries({
				queryKey: queryKey.post.selectId(postId),
			})
			queryClient.invalidateQueries({
				queryKey: queryKey.post.selectReactionByUser({ userId, postId }),
			})
		},
		// TODO: Roll back to previous state if mutation fails
		onError: (err, context) => {},
	})

	const handleReact = () => {
		mutation.mutate()
		setReactionStatus(!localIsReacted)
	}

	console.log(localIsReacted)

	return (
		<div className={wrapperClassName}>
			<Button variant="ghost" className={className} onClick={handleReact}>
				<Heart
					className={cn(
						"w-[20px]",
						localIsReacted ? "animate-fillHeart" : "animate-unfillHeart",
					)}
				/>
			</Button>
			<span>{initialReactionCount}</span>
		</div>
	)
}
