"use client"
import { Button } from "@components/atoms/button"
import { Forward } from "lucide-react"

type PostShareButtonProps = {
	userId: string
	postId: number
	initialShareCount: number
	className?: string
}

export default function PostShareButton({
	userId,
	postId,
	initialShareCount,
	className,
}: PostShareButtonProps) {
	const handleClick = () => {}
	return (
		<>
			<Button variant="ghost" className={className} onClick={handleClick}>
				<Forward />
				<span>{initialShareCount}</span>
			</Button>
		</>
	)
}
