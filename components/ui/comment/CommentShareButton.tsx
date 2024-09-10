"use client"

import { Button } from "@components/ui/Button"
import { Forward } from "lucide-react"
import React from "react"

type PostShareButtonProps = {
	userId: string
	commentId: string
	initialShareCount: number
	className?: string
	wrapperClassName?: string
}

/*
 * TODO:
 *  Fetch all user's followers -> Share the post to a follower or all followers
 */

export default function CommentShareButton({
	userId,
	commentId,
	initialShareCount,
	className,
	wrapperClassName,
}: PostShareButtonProps) {
	const [shareCount, setShareCount] = React.useState(initialShareCount)

	return (
		<div className={wrapperClassName}>
			<Button variant="ghost" className={className}>
				<Forward />
			</Button>
			<span>{shareCount}</span>
		</div>
	)
}
