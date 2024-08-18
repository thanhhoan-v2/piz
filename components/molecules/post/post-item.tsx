"use client"
import { Button } from "@components/atoms/button"
import {
	type CreatePostReactionProps,
	createPostReaction,
} from "@prisma/functions/post/reaction"
import React from "react"

export type PostItemType = "love" | "hate" | "comment" | "share"

export type PostItemProps = {
	key: string
	type: PostItemType
	icon: JSX.Element
	count: number
}

export default function PostItem({
	key,
	type,
	icon,
	count,
	userId,
	postId,
	reactionType,
}: PostItemProps & CreatePostReactionProps) {
	// The `useTransition` hook is a part of React's concurrent features.
	// It allows you to mark updates as "transitions," which means they can be interrupted by more urgent updates.
	// This is particularly useful for improving the user experience by keeping the UI responsive during longer-running updates.
	const [isPending, startTransition] = React.useTransition()

	// Use `startTransition` to `createPostReaction` asynchronously
	const handleClick = () => {
		if (type === "love" || type === "hate") {
			startTransition(async () => {
				await createPostReaction({ userId, postId, reactionType })
			})
		}
	}

	return (
		<Button
			key={key}
			variant="ghost"
			className="flex gap-2"
			onClick={handleClick}
		>
			{icon}
			<span>{count}</span>
		</Button>
	)
}
