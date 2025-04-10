"use client"

import type { PostVisibilityEnumType } from "@/types/post.types"
import { Button } from "@components/ui/Button"
import { cn } from "@utils/cn"
import { MessageSquare } from "lucide-react"
import React from "react"
import PostCommentsDialog from "./PostCommentsDialog"

type PostCommentButtonProps = {
	initialCommentCount: number
	className?: string
	wrapperClassName?: string
	// user related
	userId: string
	userAvatarUrl: string | null
	userName: string | null
	// post related
	postId: string
	postContent: string
	postVisibility?: PostVisibilityEnumType
	postCreatedAt: Date
	postUpdatedAt: Date | null
	postImageUrl?: string | null
	postVideoUrl?: string | null
	snippetId?: string | null
	teamId?: string | null
}

export default function PostCommentButton({
	className,
	wrapperClassName,
	initialCommentCount,
	// user related props
	userId,
	userAvatarUrl,
	userName,
	// post related props
	postId,
	postContent,
	postVisibility,
	postCreatedAt,
	postUpdatedAt,
	postImageUrl,
	postVideoUrl,
	snippetId,
	teamId,
}: PostCommentButtonProps) {
	const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false)

	return (
		<>
			<div className={wrapperClassName}>
				<Button
					variant="ghost"
					className={cn(className, "max-w-[100px]")}
					onClick={() => setIsDialogOpen(true)}
				>
					<MessageSquare />
				</Button>
				<span className="ml-1">{initialCommentCount}</span>
			</div>

			{/* Comments Dialog */}
			<PostCommentsDialog
				isOpen={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				// User related props
				userId={userId}
				userName={userName}
				userAvatarUrl={userAvatarUrl}
				// Post related props
				postId={postId}
				postContent={postContent}
				postVisibility={postVisibility}
				postCreatedAt={postCreatedAt}
				postUpdatedAt={postUpdatedAt}
				postImageUrl={postImageUrl}
				postVideoUrl={postVideoUrl}
				snippetId={snippetId}
				teamId={teamId}
			/>
		</>
	)
}
