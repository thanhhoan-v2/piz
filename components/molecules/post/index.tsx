import { Avatar, AvatarFallback, AvatarImage } from "@components/atoms/avatar"
import PostCommentButton from "@components/molecules/post/post-comment-button"
import PostDropdownMenu from "@components/molecules/post/post-dropdown-menu"
import PostReactButton from "@components/molecules/post/post-react-button"
import PostShareButton from "@components/molecules/post/post-share-button"
import PostVisibilityBadge from "@components/molecules/post/post-visibility-badge"
import { ROUTE } from "@constants/route"
import { getPostInfo } from "@prisma/functions/post"
import { getPostReaction } from "@prisma/functions/post/reaction"
import type { PostProps } from "@prisma/global"
import { cn } from "@utils/cn"
import { calculateTimeDiff } from "@utils/time.helpers"
import { CircleUser } from "lucide-react"
import type { Route } from "next"
import Link from "next/link"

export default async function Post({
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
	// Get the number of loves, hates, comments
	const { noReactions, noComments, noShares } = await getPostInfo(id)

	// Get the reaction of the post
	const fetchedPostReaction = await getPostReaction(userId, id)

	const postButtonClassName = "flex gap-2"

	// If post is deleted, return null
	if (isDeleted) return null

	return (
		<>
			<div className="mb-2 flex min-h-[100px] w-full flex-col justify-between rounded-lg bg-background-item px-5 py-3">
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
										href={cn(ROUTE.HOME, userName) as Route}
										className="font-bold hover:underline hover:decoration-wavy hover:underline-offset-2"
									>
										{userName}
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
						isReacted={!!fetchedPostReaction}
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
		</>
	)
}
