import { Avatar, AvatarFallback, AvatarImage } from "@components/atoms/avatar"
import { Badge } from "@components/atoms/badge"
import { Button } from "@components/atoms/button"
import PostCommentButton from "@components/molecules/post/post-comment-button"
import PostReactButton from "@components/molecules/post/post-react-button"
import PostShareButton from "@components/molecules/post/post-share-button"
import { ROUTE } from "@constants/route"
import { getPostInfo } from "@prisma/functions/post"
import { getPostReaction } from "@prisma/functions/post/reaction"
import type { PostProps } from "@prisma/global"
import { cn } from "@utils/cn"
import { CircleUser, Ellipsis } from "lucide-react"
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
								<Badge className="w-fit" variant="outline">
									{visibility}
								</Badge>
							</div>
							<div className="flex flex-col gap-4">
								<div className="whitespace-pre-wrap">{content}</div>
							</div>
						</div>
					</div>

					<Button variant="ghost">
						<Ellipsis />
					</Button>
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

export const calculateTimeDiff = (createdAt: Date, updatedAt: Date | null) => {
	const currentTime = new Date()
	const givenTime = updatedAt ?? createdAt

	// Calculate the difference in milliseconds
	const differenceInMilliseconds = currentTime.getTime() - givenTime?.getTime()

	// Convert milliseconds to seconds, minutes, hours, days
	const seconds = Math.floor(differenceInMilliseconds / 1000)
	const minutes = Math.floor(differenceInMilliseconds / (1000 * 60))
	const hours = Math.floor(differenceInMilliseconds / (1000 * 60 * 60))
	const days = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24))

	let timeAgo = `${seconds} seconds ago`
	if (seconds > 60) {
		timeAgo = `${minutes} minutes ago`
	}
	if (minutes > 60) {
		timeAgo = `${hours} hours ago`
	}
	if (hours > 24) {
		timeAgo = `${days} days ago`
	}

	return timeAgo
}
