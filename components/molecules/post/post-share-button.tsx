"use client"

import { Button } from "@components/atoms/button"
import { Forward } from "lucide-react"
import React from "react"

type PostShareButtonProps = {
	userId: string
	postId: number
	initialShareCount: number
	className?: string
}

/*
 * TODO:
 *  Fetch all user's followers -> Share the post to a follower or all followers
 */

export default function PostShareButton({
	userId,
	postId,
	initialShareCount,
	className,
}: PostShareButtonProps) {
	const [shareCount, setShareCount] = React.useState(initialShareCount)

	return (
		<>
			<Button variant="ghost" className={className}>
				<Forward />
				<span>{shareCount}</span>
			</Button>
		</>
	)
}
