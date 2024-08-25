"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@components/atoms/avatar"
import PostCommentButton from "@components/molecules/post/post-comment-button"
import PostDropdownMenu from "@components/molecules/post/post-dropdown-menu"
import PostReactButton from "@components/molecules/post/post-react-button"
import PostShareButton from "@components/molecules/post/post-share-button"
import PostVisibilityBadge from "@components/molecules/post/post-visibility-badge"
import { useQueryDataAppUser } from "@hooks/queries/app-user"
import { getPostInfo } from "@prisma/functions/post"
import { getPostReaction } from "@prisma/functions/post/reaction"
import type { PostProps } from "@prisma/global"
import { calculateTimeDiff } from "@utils/time.helpers"
import { CircleUser, Crown } from "lucide-react"
import type { Route } from "next"
import Link from "next/link"
import React from "react"
import { useState } from "react"

export default function Post({
	id,
	userId,
	userName,
	userAvatarUrl,
	content,
	visibility,
	createdAt,
	updatedAt,
	isDeleted,
}: PostProps) {
	const [appUserName, setAppUserName] = useState<string | null>(null)
	const [noReactions, setNoReactions] = useState<number>(0)
	const [noComments, setNoComments] = useState<number>(0)
	const [noShares, setNoShares] = useState<number>(0)
	const [fetchedPostReaction, setFetchedPostReaction] = useState<boolean>(false)

	const appUser = useQueryDataAppUser()
	const queriedUserName = appUser?.user_metadata?.userName

	// const queryClient = useQueryClient()
	// const user = queryClient.getQueryData([USER.APP])
	// console.log("user ", user.user_metadata.user_name)

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	React.useEffect(() => {
		const fetchData = async () => {
			// Get the current user to check if the post is created by the current user
			setAppUserName(queriedUserName || null)

			// const appUser = useQueryDataAppUser()
			// console.log(appUser)

			// Get the number of loves, hates, comments
			const { noReactions, noComments, noShares } = await getPostInfo(id)
			setNoReactions(noReactions)
			setNoComments(noComments)
			setNoShares(noShares)

			// Get the reaction of the post
			const fetchedPostReaction = await getPostReaction(userId, id)
			setFetchedPostReaction(!!fetchedPostReaction)
		}

		fetchData()
	}, [id, userId])

	const postButtonClassName = "flex gap-2"

	// If post is deleted, return null
	if (isDeleted) return null

	return (
		<div
			key={id}
			className="mb-2 flex min-h-[100px] w-full min-w-[600px] flex-col justify-between rounded-lg bg-background-item px-5 py-3"
		>
			<div className="flex justify-between">
				<div className="flex items-start gap-3">
					{userAvatarUrl ? (
						<Avatar className="h-12 w-12">
							<AvatarImage src={userAvatarUrl ?? ""} alt="User Avatar" />
							<AvatarFallback>PIZ</AvatarFallback>
						</Avatar>
					) : (
						<CircleUser />
					)}

					<div className="flex flex-col gap-2">
						<div>
							<div className="flex-y-center gap-4">
								<Link
									href={`/${userName}` as Route}
									className="flex items-center gap-2 font-bold hover:underline hover:decoration-wavy hover:underline-offset-2"
								>
									<p>{userName}</p>
									{appUserName === userName && <Crown className="size-4" />}
								</Link>
								<p className="text-slate-500 text-sm">
									{calculateTimeDiff(createdAt, updatedAt)}
								</p>
							</div>
							<PostVisibilityBadge visibility={visibility} />
						</div>
						<div className="flex flex-col gap-4">
							<div className="whitespace-pre-wrap">{content}</div>
						</div>
					</div>
				</div>

				<PostDropdownMenu userId={userId} postId={id} />
			</div>

			<div className="mx-2 my-4 flex gap-2">
				<PostReactButton
					userId={userId}
					postId={id}
					initialReactionCount={noReactions}
					isReacted={fetchedPostReaction}
					className={postButtonClassName}
				/>
				<PostCommentButton
					initialCommentCount={noComments}
					className={postButtonClassName}
					// user related
					userId={userId}
					userName={userName}
					userAvatarUrl={userAvatarUrl}
					// post related
					postId={id}
					postContent={content}
					postTimeDiff={calculateTimeDiff(createdAt, updatedAt)}
					postVisibility={visibility}
				/>
				<PostShareButton
					userId={userId}
					postId={id}
					initialShareCount={noShares}
					className={postButtonClassName}
				/>
			</div>
		</div>
	)
}
