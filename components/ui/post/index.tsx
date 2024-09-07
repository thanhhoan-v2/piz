"use client"

import { Button } from "@components/ui/Button"
import { Skeleton } from "@components/ui/Skeleton"
import PostCommentButton from "@components/ui/post/PostCommentButton"
import PostDropdownMenu from "@components/ui/post/PostDropdownMenu"
import PostReactButton from "@components/ui/post/PostReactButton"
import PostShareButton from "@components/ui/post/PostShareButton"
import PostUserInfo from "@components/ui/post/PostUserInfo"
import type { Post as IPost } from "@prisma/client"
import { useQueryAppUser } from "@queries/client/appUser"
import { useQueryPostCounts, useQueryPostReaction } from "@queries/client/post"
import { cn } from "@utils/cn"
import { MessageSquare } from "lucide-react"
import type { Route } from "next"
import Link from "next/link"

const postButtonClassName = "flex flex-none h-[30px] w-[50px] gap-2"
const postButtonWrapperClassName = "flex-y-center gap-2"
const widths =
	"mobile_s:w-[300px] mobile_m:w-[350px] mobile_l:w-[400px] tablet:w-[550px] laptop:w-[650px]"

type PostProps = {
	isPostPage?: boolean
}

export default function Post({
	id,
	userId, // id of the poster
	userName, // username of the poster
	userAvatarUrl,
	content,
	visibility,
	createdAt,
	updatedAt,
	isDeleted,
	// If it's user/post/ page then it acts as Post Comment Button,
	// else acts as Link to post page
	isPostPage = false,
}: IPost & PostProps) {
	// Get the app user byt query data
	const { data: user } = useQueryAppUser()
	const appUserName = user?.user_metadata.userName
	const appUserId = user?.id

	// Get the post counts by query data
	const {
		data: postCounts,
		isSuccess: isPostCountsQuerySuccess,
		isLoading: isPostCountsQueryLoading,
	} = useQueryPostCounts({ postId: id })
	const noReactions = postCounts?.noReactions
	const noComments = postCounts?.noComments
	const noShares = postCounts?.noShares

	// Get the reaction of the post by the app user by query data
	const {
		data: queriedPostReactionByAppUser,
		isSuccess: isPostReactionQuerySuccess,
	} = useQueryPostReaction({
		userId: appUserId,
		postId: id,
	})

	if (isDeleted) return null

	return (
		<div
			key={id}
			className={cn(
				"mb-2 flex min-h-[100px] w-full flex-col justify-between rounded-lg bg-background-item px-5 py-3",
				widths,
			)}
		>
			<div className="flex justify-between">
				<PostUserInfo
					userName={userName}
					userAvatarUrl={userAvatarUrl}
					content={content}
					visibility={visibility}
					createdAt={createdAt}
					updatedAt={updatedAt}
					appUserName={appUserName}
				/>

				<PostDropdownMenu
					userId={userId}
					postId={id}
					userName={userName}
					content={content}
				/>
			</div>

			<div className="mx-2 mt-6 flex h-[30px] gap-5">
				{isPostCountsQueryLoading && (
					<>
						<Skeleton className={postButtonClassName} />
						<Skeleton className={postButtonClassName} />
						<Skeleton className={postButtonClassName} />
					</>
				)}
				{isPostCountsQuerySuccess && (
					<>
						{isPostReactionQuerySuccess ? (
							<PostReactButton
								className={postButtonClassName}
								wrapperClassName={postButtonWrapperClassName}
								userId={appUserId}
								postId={id}
								initialReactionCount={noReactions ?? 0}
								isReacted={!!queriedPostReactionByAppUser}
							/>
						) : (
							<Skeleton className={postButtonClassName} />
						)}

						{/* comment button on user feed -> link */}
						{/*  comment button on (individual) post page -> comment button */}
						{isPostPage ? (
							<PostCommentButton
								className={postButtonClassName}
								wrapperClassName={postButtonWrapperClassName}
								initialCommentCount={noComments ?? 0}
								// User related props
								userId={userId}
								userName={userName}
								userAvatarUrl={userAvatarUrl}
								// Post related props
								postId={id}
								postContent={content}
								postCreatedAt={createdAt}
								postUpdatedAt={updatedAt}
								postVisibility={visibility}
							/>
						) : (
							<Link
								href={`${userName}/post/${id}` as Route}
								className={postButtonWrapperClassName}
							>
								<Button
									variant="ghost"
									className={cn(postButtonClassName, "max-w-[100px]")}
								>
									<MessageSquare />
								</Button>
								<span>{noComments}</span>
							</Link>
						)}

						<PostShareButton
							className={postButtonClassName}
							wrapperClassName={postButtonWrapperClassName}
							userId={userId}
							postId={id}
							initialShareCount={noShares ?? 0}
						/>
					</>
				)}
			</div>
		</div>
	)
}
