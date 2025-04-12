"use client"

import type { PostVisibilityEnumType } from "@/types/post.types"
import { Button } from "@components/ui/Button"
import { Dialog, DialogContent, DialogTitle } from "@components/ui/Dialog"
import { Separator } from "@components/ui/Separator"
import { Skeleton } from "@components/ui/Skeleton"
import { Textarea } from "@components/ui/Textarea"
import PostComment from "@components/ui/comment"
import PostContent from "@components/ui/post/PostContent"
import type { PostCounts } from "@components/ui/post/PostReactButton"
import PostHeader from "@components/ui/post/PostUserInfo"
import type { Comment } from "@prisma/client"
import { useQueryAllComments } from "@queries/client/comment"
import { type CreateCommentProps, createComment } from "@queries/server/comment"
import { useUser } from "@stackframe/stack"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { buildCommentTree } from "@utils/comment-tree.helpers"
import { queryKey } from "@utils/queryKeyFactory"
import { generateBase64uuid } from "@utils/uuid.helpers"
import { Loader2 } from "lucide-react"
import React from "react"

type PostCommentsDialogProps = {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
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

// Comment characters limit
const charsLimit = 550

export default function PostCommentsDialog({
	isOpen,
	onOpenChange,
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
}: PostCommentsDialogProps) {
	const [userInput, setUserInput] = React.useState("")
	const textareaRef = React.useRef<HTMLTextAreaElement>(null)
	const commentsEndRef = React.useRef<HTMLDivElement>(null)

	const user = useUser()
	const currentUserId = user?.id
	const currentUserName = user?.displayName
	const currentUserAvatarUrl = user?.profileImageUrl

	// Fetch comments for this post
	const {
		data: comments,
		isLoading: isLoadingComments,
		isError: isErrorComments,
		refetch: refetchComments,
	} = useQueryAllComments({ postId, enabled: isOpen })

	// Build comment tree
	const commentTree = React.useMemo(() => {
		if (!comments) return []
		return buildCommentTree(comments)
	}, [comments])

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

			// Scroll to bottom after a short delay to allow new comment to render
			setTimeout(() => {
				commentsEndRef.current?.scrollIntoView({ behavior: "smooth" })
			}, 100)
		},
		onMutate: async (newComment) => {
			// Cancel any outgoing refetches to not overwrite our optimistic updates
			await queryClient.cancelQueries({
				queryKey: queryKey.comment.all,
			})

			// Snapshot the previous value
			const previousComments = queryClient.getQueryData(queryKey.comment.all)

			queryClient.setQueryData(queryKey.comment.all, (old: Comment[] | undefined) => [
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
					userId: currentUserId,
					commentId: newComment.id,
				}),
				null,
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
		if (!currentUserId || !currentUserName) return

		const newPostCommentId = generateBase64uuid()
		const newComment: CreateCommentProps = {
			id: newPostCommentId,
			parentId: newPostCommentId,
			postId: postId,
			userId: currentUserId,
			userName: currentUserName,
			userAvatarUrl: currentUserAvatarUrl,
			content: userInput,
		}

		addCommentMutation.mutate(newComment)
		setUserInput("")
	}

	// Textarea auto increases its height on value length
	React.useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto"
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="flex flex-col rounded-lg max-w-2xl max-h-[90vh]">
				<DialogTitle className="bg-abyssal-black text-md">
					<div className="space-y-4">
						<PostHeader
							postId={postId}
							userId={userId}
							userName={userName}
							userAvatarUrl={userAvatarUrl}
							content={postContent}
							visibility={postVisibility}
							createdAt={postCreatedAt}
							updatedAt={postUpdatedAt}
							appUserName={currentUserName}
							postImageUrl={null}
							postVideoUrl={null}
							snippetId={null}
							teamId={null}
						/>

						<PostContent
							content={postContent}
							postImageUrl={postImageUrl || null}
							postVideoUrl={postVideoUrl || null}
							snippetId={snippetId || null}
							postId={postId}
							userId={userId}
						/>
					</div>
				</DialogTitle>

				<div className="flex-1 pr-2 overflow-y-auto">
					<Separator className="my-4" />

					{/* Comments Section */}
					<div className="space-y-4">
						{isLoadingComments ? (
							<div className="space-y-6">
								{[1, 2, 3].map((i) => (
									<div key={i} className="space-y-4">
										<div className="flex gap-3">
											<Skeleton className="rounded-full w-10 h-10" />
											<div className="flex-1 space-y-2">
												<div className="flex items-center gap-2">
													<Skeleton className="w-24 h-4" />
													<Skeleton className="w-16 h-3" />
												</div>
												<Skeleton className="w-full h-16" />
											</div>
										</div>
										<div className="flex gap-4 pl-12">
											<Skeleton className="w-10 h-6" />
											<Skeleton className="w-10 h-6" />
											<Skeleton className="w-10 h-6" />
										</div>
									</div>
								))}
							</div>
						) : isErrorComments ? (
							<div className="py-4 text-red-500 text-center">
								Error loading comments.
								<Button variant="link" onClick={() => refetchComments()} className="ml-2">
									Try again
								</Button>
							</div>
						) : commentTree.length === 0 ? (
							<div className="py-4 text-gray-500 text-center">
								No comments yet. Be the first to comment!
							</div>
						) : (
							<div className="space-y-4">
								{commentTree.map((comment) => (
									<PostComment
										key={comment.id}
										{...comment}
										childrenComment={{
											...comment,
											children: comment.children ?? [],
										}}
									/>
								))}
								<div ref={commentsEndRef} />
							</div>
						)}
					</div>
				</div>

				{/* Comment Input */}
				<div className="mt-4 pt-4 border-t">
					{isLoadingComments ? (
						<div className="flex items-start gap-3">
							<div className="flex-1">
								<Skeleton className="rounded w-full h-[40px]" />
							</div>
							<Skeleton className="mt-1 w-16 h-9" />
						</div>
					) : (
						<div className="flex items-start gap-3">
							<div className="flex-1">
								<Textarea
									ref={textareaRef}
									value={userInput}
									onChange={handleInputChange}
									placeholder="Write a comment..."
									className="min-h-[40px] resize-none"
								/>
							</div>
							<Button
								onClick={handleSubmitComment}
								disabled={
									userInput.length > charsLimit ||
									userInput.length === 0 ||
									addCommentMutation.isPending
								}
								className="mt-1 h-full"
							>
								{addCommentMutation.isPending ? (
									<>
										<Loader2 className="mr-2 w-4 h-4 animate-spin" />
										Posting...
									</>
								) : (
									"Post"
								)}
							</Button>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}
