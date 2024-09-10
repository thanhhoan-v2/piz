"use client"

import { Button } from "@components/ui/Button"
import type { PostCounts } from "@components/ui/post/PostReactButton"
import { createCommentReaction } from "@queries/server/comment"
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
	parentId: string
	commentId: string
	className?: string
	wrapperClassName?: string
}

export default function CommentReactButton({
	userId,
	commentId,
	parentId,
	initialReactionCount,
	isReacted,
	className,
	wrapperClassName,
}: PostReactButtonProps) {
	const [localIsReacted, setReactionStatus] = React.useState(isReacted)
	const queryClient = useQueryClient()

	const commentReactMutation = useMutation({
		mutationKey: queryKey.comment.selectReactionByUser({
			userId: userId,
			commentId: commentId,
		}),
		mutationFn: () => createCommentReaction({ userId, commentId: commentId }),
		onMutate: async () => {
			// Cancel any outgoing refetches (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey: [
					queryKey.comment.selectReactionByUser({ userId, commentId }),
					queryKey.comment.selectCountByComment({ commentId, parentId }),
				],
			})

			// Snapshot the previous value
			const previousReaction = queryClient.getQueryData(
				queryKey.comment.selectReactionByUser({ userId, commentId }),
			)
			const previousCounts = queryClient.getQueryData(
				queryKey.comment.selectCountByComment({ commentId, parentId }),
			)

			queryClient.setQueryData(
				queryKey.comment.selectCountByComment({ commentId, parentId }),
				(prev: PostCounts) => ({
					...prev,
					noReactions: localIsReacted
						? prev.noReactions - 1
						: prev.noReactions + 1,
				}),
			)

			// Return a context object with the snapshotted value
			return { previousReaction, previousCounts }
		},
		onError: (err, variables, context) => {
			// Revert to the previous value
			if (context) {
				queryClient.setQueryData(
					queryKey.comment.selectCountByComment({ commentId, parentId }),
					context.previousCounts,
				)
				queryClient.setQueryData(
					queryKey.comment.selectReactionByUser({ userId, commentId }),
					context.previousReaction,
				)
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: [
					queryKey.comment.selectCountByComment({ commentId, parentId }),
					queryKey.comment.selectReactionByUser({ userId, commentId }),
				],
			})
		},
	})

	const handleReact = () => {
		commentReactMutation.mutate()
		setReactionStatus(!localIsReacted)
	}

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
