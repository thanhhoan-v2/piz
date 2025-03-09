"use client"

import { Button } from "@components/ui/Button"
import { cn } from "@utils/cn"
import { Share2 } from "lucide-react"
import { toast } from "sonner"

interface PostShareButtonProps {
	userId: string
	postId: string
	className?: string
	wrapperClassName?: string
}

export default function PostShareButton({
	userId,
	postId,
	className,
	wrapperClassName,
}: PostShareButtonProps) {
	const handleShare = async () => {
		try {
			// Construct the URL for the post
			const postUrl = `${window.location.origin}/${userId}/post/${postId}`
			await navigator.clipboard.writeText(postUrl)

			toast("Link copied!")
		} catch (error) {
			toast("Error")
		}
	}

	return (
		<div className={wrapperClassName}>
			<Button variant="ghost" className={className} onClick={handleShare}>
				<Share2 className={cn("w-[20px]")} />
			</Button>
		</div>
	)
}
