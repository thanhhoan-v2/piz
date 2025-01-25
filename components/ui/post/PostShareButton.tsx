"use client"

import { Button } from "@components/ui/Button"
import { useToast } from "@components/ui/toast/useToast"
import { cn } from "@utils/cn"
import { Share2 } from "lucide-react"

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
	const { toast } = useToast()

	const handleShare = async () => {
		try {
			// Construct the URL for the post
			const postUrl = `${window.location.origin}/${userId}/post/${postId}`
			await navigator.clipboard.writeText(postUrl)

			toast({
				title: "Link copied!",
				description: "Post link has been copied to clipboard",
				duration: 1500,
			})
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to copy link to clipboard",
				variant: "destructive",
			})
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
