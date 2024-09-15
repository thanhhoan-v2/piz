"use client"

import DownRightArrowSVG from "@assets/images/down-right-arrow.svg"
import { Skeleton } from "@components/ui/Skeleton"
import CommentCommentButton from "@components/ui/comment/CommentCommentButton"
import CommentReactButton from "@components/ui/comment/CommentReactButton"
import CommentShareButton from "@components/ui/comment/CommentShareButton"
import {
	postButtonClassName,
	postButtonSkeletonClassName,
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
import Image from "next/image"
import { useRouter } from "nextjs-toploader/app"

export type CommentWithChildren = Comment & { children?: CommentWithChildren[] }

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
}: CommentWithChildren & { childrenComment?: CommentWithChildren }) {
	const router = useRouter()

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

	const handleCommentClick = () => {
		router.push(`/${userName}/post/${postId}/comment/${id}`)
	}

	const handleCommentKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter") handleCommentClick()
	}

	if (isDeleted) return null

	return (
		<>
			<div key={id + userId} className="flex-col gap-2">
				<div>
					<div
						onClick={handleCommentClick}
						onKeyUp={handleCommentKeyUp}
						className={cn(
							"flex min-h-[100px] w-full cursor-pointer flex-col justify-between rounded-t-lg bg-background-item px-5 py-3",
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
					</div>
					{isCommentCountsQueryLoading && (
						<div className="flex gap-5 rounded-b-lg bg-background-item px-2 py-3 pl-4">
							<Skeleton
								key={`${id}1`}
								className={postButtonSkeletonClassName}
							/>
							<Skeleton
								key={`${id}2`}
								className={postButtonSkeletonClassName}
							/>
							<Skeleton
								key={`${id}3`}
								className={postButtonSkeletonClassName}
							/>
						</div>
					)}
					{isCommentCountsQuerySuccess && (
						<div className="mt-0 flex h-[30px] gap-5 rounded-b-lg bg-background-item px-2 py-6">
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
									<div className={postButtonWrapperClassName}>
										<Skeleton className={postButtonClassName} />
									</div>
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
						</div>
					)}
				</div>

				{/* Recursive child comments */}
				{degree < 2 && childrenComment ? (
					<div key={userId + id} className=" ml-[10px] flex gap-4">
						{/* biome-ignore lint/style/noNonNullAssertion: <explanation> */}
						{childrenComment!.children!.length > 0 && (
							<div>
								<Image
									src={DownRightArrowSVG}
									width={35}
									height={35}
									alt=" Comment arrow"
								/>
							</div>
						)}
						<div className="w-full flex-col">
							{childrenComment?.children?.map((child, index) => (
								<>
									<PostComment
										key={child.id + child.userId + index}
										{...child}
										childrenComment={{
											...child,
											children: child.children ?? [],
										}}
									/>
								</>
							))}
						</div>
					</div>
				) : (
					<div />
				)}
			</div>
		</>
	)
}
