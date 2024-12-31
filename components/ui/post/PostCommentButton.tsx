"use client"

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
import type { PostVisibilityEnumType } from "@components/ui/form/PostForm"
import type { PostCounts } from "@components/ui/post/PostReactButton"
import PostUserInfo from "@components/ui/post/PostUserInfo"
import type { Comment } from "@prisma/client"
import { type CreateCommentProps, createComment } from "@queries/server/comment"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@utils/cn"
import { queryKey } from "@utils/queryKeyFactory"
import { generateBase64uuid } from "@utils/uuid.helpers"
import { HashIcon, ImageIcon, MenuIcon, MessageSquare } from "lucide-react"
import React from "react"

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
}

// Comment characters limit
const charsLimit = 550

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
}: PostCommentButtonProps) {
	const [modalIsOpen, setOpenModal] = React.useState<boolean>(false)
	const [discardAlertIsOpen, setOpenDiscardAlert] =
		React.useState<boolean>(false)
	const [userInput, setUserInput] = React.useState("")
	const textareaRef = React.useRef<HTMLTextAreaElement>(null)

	const handleInputChange = React.useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setUserInput(e.target.value)
		},
		[],
	)

	const queryClient = useQueryClient()

	const addCommentMutation = useMutation({
		mutationKey: queryKey.comment.insert(),
		mutationFn: async (newComment: CreateCommentProps) =>
			await createComment(newComment),
		onMutate: async (newComment) => {
			// Cancel any outgoing refetches to not overwrite our optimistic updates
			await queryClient.cancelQueries({
				queryKey: queryKey.comment.all,
			})

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
				null,
			)
			queryClient.setQueryData(
				queryKey.post.selectCount(postId),
				(prev: PostCounts) => ({
					...prev,
					noComments: prev.noComments + 1,
				}),
			)

			// Return a context object with the snapshotted value
			return { previousComments }
		},
	})

	const handleSubmitComment = () => {
		const newPostCommentId = generateBase64uuid()
		const newComment: CreateCommentProps = {
			id: newPostCommentId,
			parentId: newPostCommentId,
			postId: postId,
			userId: userId,
			userName: userName,
			userAvatarUrl: userAvatarUrl,
			content: userInput,
		}

		if (userName !== null && newPostCommentId) {
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
					className="flex-col rounded-lg border-0"
					onPointerDownOutside={handleOpenDiscardAlert}
				>
					<PostUserInfo
						userName={userName}
						userAvatarUrl={userAvatarUrl}
						content={postContent}
						visibility={postVisibility}
						createdAt={postCreatedAt}
						updatedAt={postUpdatedAt}
						appUserName={userName}
					/>

					{/* form */}
					<div className="mb-8 w-full flex-start flex-col gap-2">
						<Textarea
							ref={textareaRef}
							value={userInput}
							onChange={handleInputChange}
							placeholder={cn("Reply to ", userName)}
							className=" min-h-[10px] resize-none border-none p-0 focus-visible:ring-0"
						/>
						<div className="flex space-x-4">
							<ImageIcon />
							<HashIcon />
							<MenuIcon />
						</div>
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
						<AlertDialogCancel onClick={() => setOpenModal(true)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction onClick={() => setUserInput("")}>
							Discard
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
