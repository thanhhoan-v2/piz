"use client"

import { getUserById } from "@app/actions/user"
import { Separator } from "@components/ui/Separator"
import { Skeleton } from "@components/ui/Skeleton"
import PostCommentButton from "@components/ui/post/PostCommentButton"
import PostContent from "@components/ui/post/PostContent"
import PostReactButton from "@components/ui/post/PostReactButton"
import PostShareButton from "@components/ui/post/PostShareButton"
import PostUserInfo from "@components/ui/post/PostUserInfo"
import type { Post as IPost } from "@prisma/client"
import { useQueryPostCounts, useQueryPostReaction } from "@queries/client/post"
import { useUser } from "@stackframe/stack"
import { cn } from "@utils/cn"
import { Sparkles } from "lucide-react"
import { useRouter } from "nextjs-toploader/app"
import React from "react"
import WelcomeModal from "../modal/WelcomeModal"

export const postButtonClassName = "flex flex-none h-[30px] w-[50px] gap-2"
export const postButtonSkeletonClassName = "flex flex-none h-[30px] w-[70px] gap-2"
export const postButtonWrapperClassName = "flex-y-center gap-2 bg-background-item"
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
	userId,
	content,
	createdAt,
	updatedAt,
	isDeleted,
	postImageUrl,
	postVideoUrl,
	snippetId,
	teamId,
}: IPost & PostProps) {
	const router = useRouter()
	const [posterInfo, setPosterInfo] = React.useState<{
		userName: string
		userAvatarUrl: string
		userId: string
	}>()
	const user = useUser()
	const isSignedIn = !!user

	React.useEffect(() => {
		const fetchUserInfo = async () => {
			const userInfo = await getUserById(userId)
			setPosterInfo(userInfo)
		}
		fetchUserInfo()
	}, [userId])

	// Get the app user byt query data
	const appUserName = user?.displayName
	const appUserId = user?.id

	// Get the post counts by query data
	const {
		data: postCounts,
		isSuccess: isPostCountsQuerySuccess,
		isLoading: isPostCountsQueryLoading,
	} = useQueryPostCounts({ postId: id })
	const noReactions = postCounts?.noReactions
	const noComments = postCounts?.noComments
	// const noShares = postCounts?.noShares

	// Get the reaction of the post by the app user by query data
	const { data: queriedPostReactionByAppUser, isSuccess: isPostReactionQuerySuccess } =
		useQueryPostReaction({
			userId: appUserId ?? undefined,
			postId: id,
		})

	// These functions have been moved to PostContent.tsx

	if (isDeleted) return null

	return (
		<div>
			{!user ? (
				<WelcomeModal>
					<div>
						<div
							key={id}
							className={cn(
								"mb-0 flex min-h-[100px] w-full bg-cynical-black p-5 transform cursor-pointer flex-col justify-between transition-transform hover:scale-103",
								postWidths,
							)}
						>
							<div className="flex justify-between">
								<PostUserInfo
									postId={id}
									userId={userId}
									userName={posterInfo?.userName}
									userAvatarUrl={posterInfo?.userAvatarUrl}
									createdAt={createdAt}
									updatedAt={updatedAt}
									appUserName={appUserName}
									content={content}
									postImageUrl={postImageUrl}
									postVideoUrl={postVideoUrl}
									snippetId={snippetId}
									teamId={teamId}
								/>
							</div>
							<PostContent
								content={content}
								postImageUrl={postImageUrl}
								postVideoUrl={postVideoUrl}
								snippetId={snippetId}
								postId={id}
								userId={posterInfo?.userId}
							/>
						</div>

						{postIndex! < postsLength! - 1 && (
							<div className="flex-center gap-3 my-4">
								<Separator className="w-1/3" />
								<Sparkles color="#272727" size={15} />
								<Separator className="w-1/3" />
							</div>
						)}

						{/* Add space at the bottom of the post */}
						<div className="mb-2" />
					</div>
				</WelcomeModal>
			) : (
				<>
					<div
						key={id}
						className={cn(
							"mb-0 flex min-h-[100px] w-full bg-cynical-black p-5 transform cursor-pointer flex-col justify-between transition-transform hover:scale-103",
							postWidths,
						)}
					>
						<div className="flex justify-between">
							<PostUserInfo
								postId={id}
								userId={userId}
								userName={posterInfo?.userName}
								userAvatarUrl={posterInfo?.userAvatarUrl}
								createdAt={createdAt}
								updatedAt={updatedAt}
								appUserName={appUserName}
								content={content}
								postImageUrl={postImageUrl}
								postVideoUrl={postVideoUrl}
								snippetId={snippetId}
								teamId={teamId}
							/>

							{/* {isSignedIn && ( */}
							{/* 	<PostDropdownMenu */}
							{/* 		userId={userId} */}
							{/* 		postId={id} */}
							{/* 		userName={posterInfo?.userName ?? null} */}
							{/* 		content={content} */}
							{/* 	/> */}
							{/* )} */}
						</div>
						{/* <PostContent
							content={content}
							postImageUrl={postImageUrl}
							postVideoUrl={postVideoUrl}
							snippetId={snippetId}
							postId={id}
							userId={posterInfo?.userId}
						/> */}
					</div>
					{/* {isPostCountsQueryLoading && ( */}
					{/* 	<div className="flex gap-5 bg-background-item px-2 py-3 pl-4 rounded-b-lg"> */}
					{/* 		<Skeleton className={postButtonSkeletonClassName} /> */}
					{/* 		<Skeleton className={postButtonSkeletonClassName} /> */}
					{/* 		<Skeleton className={postButtonSkeletonClassName} /> */}
					{/* 	</div> */}
					{/* )} */}
					{isPostCountsQuerySuccess && isSignedIn ? (
						<div className={cn("mt-0 flex h-[30px] gap-5 bg-cynical-black px-2 py-6", postWidths)}>
							<div className="flex justify-between w-full">
								<div className="flex gap-2">
									{isPostReactionQuerySuccess ? (
										<PostReactButton
											className={postButtonClassName}
											wrapperClassName={postButtonWrapperClassName}
											userId={appUserId ?? undefined}
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
										userName={posterInfo?.userName ?? null}
										userAvatarUrl={posterInfo?.userAvatarUrl ?? null}
										// Post related props
										postId={id}
										postContent={content}
										postCreatedAt={createdAt}
										postUpdatedAt={updatedAt}
									/>
								</div>

								<PostShareButton
									className={postButtonClassName}
									wrapperClassName={postButtonWrapperClassName}
									userId={userId}
									postId={id}
									// initialShareCount={noShares ?? 0}
								/>
							</div>
						</div>
					) : (
						<div className={cn("h-4 rounded-lg bg-background-item", postWidths)} />
					)}

					{postIndex! < postsLength! - 1 && (
						<div className="flex-center gap-3 my-4">
							<Separator className="w-1/3" />
							<Sparkles color="#272727" size={15} />
							<Separator className="w-1/3" />
						</div>
					)}

					{/* Add space at the bottom of the post */}
					<div className="mb-2" />
				</>
			)}
		</div>
	)
}
