"use client"

import { Button } from "@components/ui/Button"
import { Forward } from "lucide-react"

type PostShareButtonProps = {
	userId: string
	postId: string
	initialShareCount?: number
	className?: string
	wrapperClassName?: string
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
	wrapperClassName,
}: PostShareButtonProps) {
	// const [shareCount, setShareCount] = React.useState(initialShareCount)

	return (
		<div className={wrapperClassName}>
			<Button variant="ghost" className={className}>
				<Forward />
			</Button>
			{/* <span>{shareCount}</span> */}
		</div>
	)
}
