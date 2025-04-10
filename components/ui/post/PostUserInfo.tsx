"use client"

import { getUserById } from "@app/actions/user"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/Avatar"
import { Button } from "@components/ui/Button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@components/ui/Dialog"
import { useDeletePostMutation } from "@queries/client/post"
import { getFollow } from "@queries/server/follow"
import { useUser } from "@stackframe/stack"
import { useQuery } from "@tanstack/react-query"
import { avatarPlaceholder } from "@utils/image.helpers"
import { queryKey } from "@utils/queryKeyFactory"
import { firstLetterToUpper } from "@utils/string.helpers"
import { formatDistanceToNow } from "date-fns"
import { XIcon } from "lucide-react"
import type { Route } from "next"
import Link from "next/link"
import { useEffect, useState } from "react"
import PostContent from "./PostContent"

type PostUserInfoProps = {
	userName?: string | null
	userAvatarUrl?: string | null
	userId?: string
	visibility?: string
	createdAt: Date
	updatedAt: Date | null
	appUserName?: string | null
	// PostContent's
	content: string
	postImageUrl: string | null
	postVideoUrl: string | null
	snippetId: string | null
	postId: string
}

type DeletePostButtonProps = {
	postId: string
	userId: string
}

function DeletePostButton({ postId, userId }: DeletePostButtonProps) {
	const [open, setOpen] = useState(false)
	const deletePostMutation = useDeletePostMutation()
	const [isDeleting, setIsDeleting] = useState(false)

	const handleDeletePost = () => {
		setIsDeleting(true)
		console.log(postId, userId)
		deletePostMutation.mutate(
			{ postId, userId },
			{
				onSettled: () => {
					setIsDeleting(false)
					setOpen(false) // Close dialog after completion
				},
			},
		)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="text-muted-foreground hover:text-destructive hover:bg-transparent"
				>
					<XIcon size={16} />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Post</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete this post? This action cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button variant="destructive" onClick={handleDeletePost} disabled={isDeleting}>
						{isDeleting ? "Deleting..." : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export default function PostUserInfo({
	userId,
	visibility,
	createdAt,
	content,
	postImageUrl,
	postVideoUrl,
	snippetId,
	postId,
}: PostUserInfoProps) {
	const user = useUser()

	const [posterInfo, setPosterInfo] = useState<{
		userName: string
		userAvatarUrl: string
		userId: string
	}>()

	useEffect(() => {
		const fetchUserInfo = async () => {
			const userInfo = await getUserById(userId)
			setPosterInfo(userInfo)
		}
		fetchUserInfo()
	}, [userId])

	// Get if I'm following them
	const { data: followData } = useQuery({
		queryKey: queryKey.follow.selectFollower(user?.id ?? ""),
		queryFn: () =>
			getFollow({
				followerId: user?.id ?? "",
				followeeId: userId ?? "",
			}),
		enabled: !!user?.id && !!userId && user?.id !== userId,
	})

	// Get if they're following me
	const { data: followsMe } = useQuery({
		queryKey: queryKey.follow.selectFollower(userId ?? ""),
		queryFn: () =>
			getFollow({
				followerId: userId ?? "",
				followeeId: user?.id ?? "",
			}),
		enabled: !!user?.id && !!userId && user?.id !== userId,
	})

	const getFollowStatus = () => {
		// Don't show status if it's the user's own post
		if (userId === user?.id) return null

		// Don't show status for certain visibility settings
		if (visibility === "PRIVATE" || visibility === "ME_ONLY") return null

		// // If both users follow each other, only show "Following"
		// if (
		// 	followData?.requestStatus === "ACCEPTED" &&
		// 	followsMe?.requestStatus === "ACCEPTED"
		// ) {
		// 	return <span className="text-muted-foreground text-sm">Following</span>
		// }
		//
		// // If only they follow me, show "Follows you"
		// if (followsMe?.requestStatus === "ACCEPTED") {
		// 	return <span className="text-muted-foreground text-sm">Follows you</span>
		// }
		//
		// // If only I follow them, show "Following" or "Requested"
		// if (followData?.requestStatus === "ACCEPTED") {
		// 	return <span className="text-muted-foreground text-sm">Following</span>
		// }
		// if (followData?.requestStatus === "PENDING") {
		// 	return <span className="text-muted-foreground text-sm">Requested</span> }

		return null
	}

	return (
		<>
			<div className="w-full flex-col gap-4">
				<div className="w-full flex-between text-white">
					{/* Left side */}
					<div className="flex-y-center gap-3">
						{/* Avatar */}
						<Link href={`/${userId}` as Route}>
							<Avatar>
								<AvatarImage
									src={
										posterInfo?.userAvatarUrl === "" ? avatarPlaceholder : posterInfo?.userAvatarUrl
									}
									alt={`${posterInfo?.userName}'s avatar`}
								/>
								<AvatarFallback>{firstLetterToUpper(posterInfo?.userName ?? "")}</AvatarFallback>
							</Avatar>
						</Link>

						<div>
							<div className="flex-y-center gap-2">
								{/* Username */}
								<Link href={`/${userId}` as Route}>
									<p className="font-bold hover:underline">
										{firstLetterToUpper(posterInfo?.userName ?? "")}
									</p>
								</Link>
								{/* (Posted) Time diff */}
								<p className="text-muted-foreground">
									{formatDistanceToNow(new Date(createdAt), {
										addSuffix: true,
									})}
								</p>
							</div>
							{/* Follow status */}
							<div>{getFollowStatus()}</div>
						</div>
					</div>
					{/* Right side */}
					<div>
						{/* Delete post button - only show if current user is the author */}
						{userId && userId === user?.id && <DeletePostButton postId={postId} userId={user.id} />}
					</div>
				</div>

				<PostContent
					content={content}
					postImageUrl={postImageUrl}
					postVideoUrl={postVideoUrl}
					snippetId={snippetId}
				/>
			</div>
		</>
	)
}
