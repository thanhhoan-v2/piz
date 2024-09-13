"use client"
import { Separator } from "@components/ui/Separator"
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
import { Sparkles } from "lucide-react"
import { useRouter } from "nextjs-toploader/app"

export const postButtonClassName = "flex flex-none h-[30px] w-[50px] gap-2"
export const postButtonSkeletonClassName =
	"flex flex-none h-[30px] w-[70px] gap-2"
export const postButtonWrapperClassName =
	"flex-y-center gap-2 bg-background-item"
export const postWidths =
	"mobile_s:w-[300px] mobile_m:w-[350px] mobile_l:w-[400px] tablet:w-[550px] laptop:w-[650px]"

type PostProps = {
	postIndex?: number
	postsLength?: number
}

export default function Post({
	postIndex,
	postsLength,
	id,
	userId, // id of the poster
	userName, // username of the poster
	userAvatarUrl,
	content,
	visibility,
	createdAt,
	updatedAt,
	isDeleted,
}: IPost & PostProps) {
	const router = useRouter()

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

	const handlePostClick = () => {
		router.push(`/${userName}/post/${id}`)
	}

	const handlePostKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter") handlePostClick()
	}

	if (isDeleted) return null

	return (
		<>
			<div
				key={id}
				onClick={handlePostClick}
				onKeyUp={handlePostKeyUp}
				className={cn(
					"mb-0 flex min-h-[100px] w-full transform cursor-pointer flex-col justify-between rounded-t-lg bg-background-item px-5 py-3 transition-transform hover:scale-103",
					postWidths,
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
			</div>
			{isPostCountsQueryLoading && (
				<div className="flex gap-5 rounded-b-lg bg-background-item px-2 py-3 pl-4">
					<Skeleton className={postButtonSkeletonClassName} />
					<Skeleton className={postButtonSkeletonClassName} />
					<Skeleton className={postButtonSkeletonClassName} />
				</div>
			)}
			{isPostCountsQuerySuccess ? (
				<div
					className={cn(
						"mt-0 flex h-[30px] gap-5 rounded-b-lg bg-background-item px-2 py-6",
						postWidths,
					)}
				>
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
							<div className={postButtonWrapperClassName}>
								<Skeleton className={postButtonSkeletonClassName} />
							</div>
						)}

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

						<PostShareButton
							className={postButtonClassName}
							wrapperClassName={postButtonWrapperClassName}
							userId={userId}
							postId={id}
							initialShareCount={noShares ?? 0}
						/>
					</>
				</div>
			) : (
				<>Something is wrong here 😢</>
			)}

			{/* biome-ignore lint/style/noNonNullAssertion: All posts, except last one */}
			{postIndex! < postsLength! - 1 && (
				<div className="my-4 flex-center gap-3">
					<Separator className="w-1/3" />
					<Sparkles color="#272727" size={15} />
					<Separator className="w-1/3" />
				</div>
			)}

			{/* biome-ignore lint/style/noNonNullAssertion: Last post */}
			{postIndex === postsLength! - 1 ? (
				<div className="mb-[100px]">
					<div className="mt-[100px] h-full w-full flex-center font-bold text-lg">
						No more posts for you
					</div>
				</div>
			) : (
				<div className="mb-2" />
			)}
		</>
	)
}
