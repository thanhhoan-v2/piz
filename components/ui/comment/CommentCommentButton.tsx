"use client"

import type { PostVisibilityEnumType } from "@/types/post.types"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@components/ui/AlertDialog"
import { Button } from "@components/ui/Button"
import { Dialog, DialogContent, DialogTitle } from "@components/ui/Dialog"
import { Textarea } from "@components/ui/Textarea"
import type { PostCounts } from "@components/ui/post/PostReactButton"
import PostHeader from "@components/ui/post/PostUserInfo"
import type { Comment } from "@prisma/client"
import { type CreateCommentProps, createComment } from "@queries/server/comment"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@utils/cn"
import { queryKey } from "@utils/queryKeyFactory"
import { generateBase64uuid } from "@utils/uuid.helpers"
import { MessageSquare } from "lucide-react"
import React from "react"

type CommentCommentButtonProps = {
	initialCommentCount: number
	className?: string
	wrapperClassName?: string
	userId: string
	userAvatarUrl?: string | null
	userName?: string | null
	postId: string
	postContent: string
	postVisibility?: PostVisibilityEnumType
	postCreatedAt: Date
	postUpdatedAt: Date | null
	parentId: string
	degree: number
}

// Comment characters limit
const charsLimit = 550

export default function CommentCommentButton({
	className,
	wrapperClassName,
	initialCommentCount,
	userId,
	userAvatarUrl,
	userName,
	postId,
	postContent,
	postVisibility,
	postCreatedAt,
	postUpdatedAt,
	parentId,
	degree,
}: CommentCommentButtonProps) {
	// If degree is 2 or greater, don't render the button
	if (degree >= 2) return null

	const [modalIsOpen, setOpenModal] = React.useState<boolean>(false)
	const [discardAlertIsOpen, setOpenDiscardAlert] = React.useState<boolean>(false)
	const [userInput, setUserInput] = React.useState("")
	const textareaRef = React.useRef<HTMLTextAreaElement>(null)

	const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setUserInput(e.target.value)
	}, [])

	const queryClient = useQueryClient()

	const addCommentMutation = useMutation({
		mutationKey: queryKey.comment.insert(),
		mutationFn: async (newComment: CreateCommentProps) => await createComment(newComment),
		onSuccess: () => {
			// Invalidate and refetch comments for this post
			queryClient.invalidateQueries({
				queryKey: queryKey.comment.selectPost(postId),
				exact: true,
				refetchType: "all",
			})
		},
		onMutate: async (newComment) => {
			// Cancel any outgoing refetches to not overwrite our optimistic updates
			await queryClient.cancelQueries({ queryKey: queryKey.comment.all })
			// Snapshot the previous value
			const previousComments = queryClient.getQueryData(queryKey.comment.all)

			queryClient.setQueryData(queryKey.comment.all, (old: Comment[]) => [
				newComment,
				...(old ?? []),
			])

			queryClient.setQueryData(queryKey.comment.selectCountByPost(postId), {
				noReactions: 0,
				noShares: 0,
				noComments: 0,
			})
			queryClient.setQueryData(
				queryKey.comment.selectReactionByUser({
					userId,
					commentId: newComment.id,
				}),
				null
			)
			queryClient.setQueryData(queryKey.post.selectCount(postId), (prev: PostCounts) => ({
				...prev,
				noComments: prev.noComments + 1,
			}))

			// Return a context object with the snapshotted value
			return { previousComments }
		},
	})

	const handleSubmitComment = () => {
		const newComment: CreateCommentProps = {
			id: generateBase64uuid(),
			postId: postId,
			parentId: parentId,
			degree: degree + 1,
			userId: userId,
			userName: userName,
			userAvatarUrl: userAvatarUrl,
			content: userInput,
		}

		if (userName !== null) {
			addCommentMutation.mutate(newComment)
		} else {
			throw new Error("Comment failed: User name or user avatar url is unknown")
		}

		setOpenModal(false)
		setUserInput("")
		// setCommentCount(commentCount + 1)
	}

	const handleOpenDiscardAlert = () => {
		if (userInput.length > 0) {
			// If the value is not empty, open the alert
			setOpenDiscardAlert(true)
		}
	}

	// Textarea auto increases its height on value length
	// biome-ignore lint/correctness/useExhaustiveDependencies: value is only needed here
	React.useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto"
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
		}
	}, [userInput])

	return (
		<>
			<div className={wrapperClassName}>
				<Button
					variant="ghost"
					className={cn(className, "max-w-[100px]")}
					onClick={() => setOpenModal(!modalIsOpen)}
				>
					<MessageSquare />
				</Button>
				<span>{initialCommentCount}</span>
			</div>

			<Dialog open={modalIsOpen} onOpenChange={setOpenModal}>
				<VisuallyHidden.Root>
					<DialogTitle />
				</VisuallyHidden.Root>
				<DialogContent
					className="flex-col bg-cynical-black border-0 rounded-lg"
					onPointerDownOutside={handleOpenDiscardAlert}
				>
					<PostHeader
						postId={postId}
						userName={userName}
						userAvatarUrl={userAvatarUrl}
						content={postContent}
						visibility={postVisibility}
						createdAt={postCreatedAt}
						updatedAt={postUpdatedAt}
						appUserName={userName}
						postImageUrl={null}
						postVideoUrl={null}
						snippetId={null}
						teamId={null}
					/>

					{/* form */}
					<div className="flex-col flex-start gap-2 mb-8 w-full">
						<Textarea
							ref={textareaRef}
							value={userInput}
							onChange={handleInputChange}
							placeholder={cn("Reply to ", userName)}
							className="bg-cynical-black p-0 border-none focus-visible:ring-0 min-h-[10px] resize-none"
						/>
					</div>

					{/* post button */}
					<Button
						onClick={handleSubmitComment}
						// if charsLimit is reached or value is empty -> disable
						disabled={userInput.length > charsLimit || userInput.length === 0}
					>
						Reply
					</Button>
				</DialogContent>
			</Dialog>

			{/* show when value is not empty */}
			<AlertDialog open={discardAlertIsOpen} onOpenChange={setOpenDiscardAlert}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Discard comment ?</AlertDialogTitle>
						<AlertDialogDescription />
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setOpenModal(true)}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => setUserInput("")}>Discard</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
