import { Skeleton } from "@components/ui/Skeleton"
import CommentCommentButton from "@components/ui/comment/CommentCommentButton"
import CommentReactButton from "@components/ui/comment/CommentReactButton"
import CommentShareButton from "@components/ui/comment/CommentShareButton"
import {
	postButtonClassName,
	postButtonWrapperClassName,
} from "@components/ui/post"
import PostUserInfo from "@components/ui/post/PostUserInfo"
import type { Comment } from "@prisma/client"
import { useQueryAppUser } from "@queries/client/appUser"
import {
	useQueryCommentCounts,
	useQueryCommentReaction,
} from "@queries/client/comment"
import { cn } from "@utils/cn"

export type CommentWithChildren = Comment & { children: CommentWithChildren[] }

export default function PostComment({
	id,
	userId,
	postId,
	degree,
	parentId,
	content,
	createdAt,
	updatedAt,
	isDeleted,
	userName,
	userAvatarUrl,
	childrenComment,
}: CommentWithChildren & { childrenComment: CommentWithChildren }) {
	// Get the app user byt query data
	const { data: user } = useQueryAppUser()
	const appUserId = user?.id

	// Get the post counts by query data
	const {
		data: commentCounts,
		isSuccess: isCommentCountsQuerySuccess,
		isLoading: isCommentCountsQueryLoading,
	} = useQueryCommentCounts({ commentId: id, parentId })
	const noReactions = commentCounts?.noReactions
	const noComments = commentCounts?.noComments
	const noShares = commentCounts?.noShares

	// Get the reaction of the comment by the app user by query data
	const {
		data: queriedCommentReactionByAppUser,
		isSuccess: isCommentReactionQuerySuccess,
	} = useQueryCommentReaction({
		userId: appUserId,
		commentId: id,
	})

	if (isDeleted) return null

	return (
		<>
			<div className="flex-col gap-2">
				<div
					key={id}
					className={cn(
						"flex min-h-[100px] w-full flex-col justify-between rounded-lg bg-background-item px-5 py-3",
					)}
				>
					<PostUserInfo
						isWriteOnly
						userName={userName}
						userAvatarUrl={userAvatarUrl}
						appUserName={userName}
						createdAt={new Date()}
						updatedAt={null}
						content={content}
					/>
					<div className="mx-2 mt-6 flex h-[30px] gap-5">
						{isCommentCountsQueryLoading && (
							<>
								<Skeleton className={postButtonClassName} />
								<Skeleton className={postButtonClassName} />
								<Skeleton className={postButtonClassName} />
							</>
						)}
						{isCommentCountsQuerySuccess && (
							<>
								{isCommentReactionQuerySuccess ? (
									<CommentReactButton
										className={postButtonClassName}
										wrapperClassName={postButtonWrapperClassName}
										userId={appUserId}
										commentId={id}
										parentId={parentId}
										initialReactionCount={noReactions ?? 0}
										isReacted={!!queriedCommentReactionByAppUser}
									/>
								) : (
									<Skeleton className={postButtonClassName} />
								)}

								<CommentCommentButton
									className={postButtonClassName}
									wrapperClassName={postButtonWrapperClassName}
									initialCommentCount={noComments ?? 0}
									userId={userId}
									userName={userName}
									userAvatarUrl={userAvatarUrl}
									postId={postId}
									postContent={content}
									postCreatedAt={createdAt}
									postUpdatedAt={updatedAt}
									parentId={id}
									degree={degree}
								/>

								<CommentShareButton
									className={postButtonClassName}
									wrapperClassName={postButtonWrapperClassName}
									userId={userId}
									commentId={id}
									initialShareCount={noShares ?? 0}
								/>
							</>
						)}
					</div>
				</div>

				{/* Recursive child comments */}
				<div className=" ml-[30px] flex-col">
					{childrenComment.children?.map((child) => (
						<>
							<PostComment
								key={child.id}
								{...child}
								childrenComment={{ ...child, children: child.children ?? [] }}
							/>
						</>
					))}
				</div>
			</div>
		</>
	)
}
