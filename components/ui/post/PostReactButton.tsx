"use client"

import { Button } from "@components/ui/Button"
import { createPostReaction } from "@queries/server/postReaction"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@utils/cn"
import { queryKey } from "@utils/queryKeyFactory"
import { Heart } from "lucide-react"
import React from "react"

interface PostReactButtonProps {
	userId?: string | null;
	postId: string;
	className?: string;
	wrapperClassName?: string;
	initialReactionCount: number;
	isReacted: boolean;
}

export type PostCounts = {
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

	const postReactMutation = useMutation({
		mutationKey: queryKey.post.selectReactionByUser({ userId, postId }),
		mutationFn: () => createPostReaction({ userId, postId }),
		onMutate: async () => {
			// Cancel any outgoing refetches (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey: [
					queryKey.post.selectReactionByUser({ userId, postId }),
					queryKey.post.selectCount(postId),
				],
			})

			// Snapshot the previous value
			const previousPostReaction = queryClient.getQueryData(
				queryKey.post.selectReactionByUser({ userId, postId }),
			)
			const previousPostCounts = queryClient.getQueryData(
				queryKey.post.selectCount(postId),
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

			return { previousPostReaction, previousPostCounts }
		},
		onError: (err, newReaction, context) => {
			if (context) {
				queryClient.setQueryData(
					queryKey.post.selectCount(postId),
					context.previousPostCounts,
				)
				queryClient.setQueryData(
					queryKey.post.selectReactionByUser({ userId, postId }),
					context.previousPostReaction,
				)
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: [
					queryKey.post.selectCount(postId),
					queryKey.post.selectReactionByUser({ userId, postId }),
				],
			})
		},
	})

	const handleReact = () => {
		postReactMutation.mutate()
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
