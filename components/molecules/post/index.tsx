"use client"

import { Skeleton } from "@components/atoms/skeleton"
import PostCommentButton from "@components/molecules/post/post-comment-button"
import PostDropdownMenu from "@components/molecules/post/post-dropdown-menu"
import PostReactButton from "@components/molecules/post/post-react-button"
import PostShareButton from "@components/molecules/post/post-share-button"
import PostUserInfo from "@components/molecules/post/post-user-info"
import { useQueryDataAppUser } from "@hooks/queries/app-user"
import { useQueryPostCounts, useQueryPostReaction } from "@hooks/queries/post"
import type { Post as IPost } from "@prisma/client"
import { cn } from "@utils/cn"
import React from "react"
import { useState } from "react"

const postButtonClassName = "flex flex-none h-[30px] w-[70px] gap-2"
const widths =
	"mobile_s:w-[300px] mobile_m:w-[350px] mobile_l:w-[400px] tablet:w-[550px] laptop:w-[650px]"

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
}: IPost) {
	const [postReactionByAppUser, setPostReactionByAppUser] = useState<
		boolean | null
	>(null)

	// Get the app user byt query data
	const user = useQueryDataAppUser()
	const appUserName = user?.user_metadata?.userName
	const appUserId = user?.id

	// Get the reaction of the post by the app user by query data
	const { data: queriedPostReactionByAppUser } = useQueryPostReaction({
		userId: appUserId,
		postId: id,
	})

	// Get the post counts by query data
	const { data: postCounts, isLoading } = useQueryPostCounts({ postId: id })
	const noReactions = postCounts?.noReactions
	const noComments = postCounts?.noComments
	const noShares = postCounts?.noShares

	console.log(noComments)

	React.useEffect(() => {
		const fetchData = async () => {
			// Get the reaction of the post
			// If queried reaction is found, it sets to true, otherwise false
			setPostReactionByAppUser(!!queriedPostReactionByAppUser)
		}

		fetchData()
	}, [queriedPostReactionByAppUser])

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

			<div className="mx-2 mt-6 flex h-[30px] gap-2">
				{isLoading ? (
					<>
						<Skeleton className={postButtonClassName} />
						<Skeleton className={postButtonClassName} />
						<Skeleton className={postButtonClassName} />
					</>
				) : (
					<>
						{postReactionByAppUser !== null ? (
							<PostReactButton
								className={postButtonClassName}
								userId={appUserId}
								postId={id}
								initialReactionCount={noReactions ?? 0}
								isReacted={postReactionByAppUser}
							/>
						) : (
							<Skeleton className={postButtonClassName} />
						)}
						<PostCommentButton
							className={postButtonClassName}
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
						<PostShareButton
							className={postButtonClassName}
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
