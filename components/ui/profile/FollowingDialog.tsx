"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/Avatar"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@components/ui/Dialog"
import { ScrollArea } from "@components/ui/ScrollArea"
import { Skeleton } from "@components/ui/Skeleton"
import { useQueryUserFollowing } from "@queries/client/follow"
import { useQueryClient } from "@tanstack/react-query"
import { avatarPlaceholder } from "@utils/image.helpers"
import { queryKey } from "@utils/queryKeyFactory"
import { firstLetterToUpper } from "@utils/string.helpers"
import { useCallback, useEffect, useState } from "react"
import FollowButton from "./FollowButton"

interface FollowingDialogProps {
	userId: string
	followingCount: number
	isLoading?: boolean
	trigger?: React.ReactNode
}

export default function FollowingDialog({
	userId,
	followingCount: initialFollowingCount,
	isLoading = false,
	trigger,
}: FollowingDialogProps) {
	const queryClient = useQueryClient()
	const followingQuery = useQueryUserFollowing(userId)
	// Use local state to track the count for immediate UI updates
	const [localFollowingCount, setLocalFollowingCount] = useState(initialFollowingCount)
	// Sync localFollowingCount with actual data when it changes
	useEffect(() => {
		if (followingQuery.data) {
			setLocalFollowingCount(followingQuery.data.length)
		}
	}, [followingQuery.data])

	const fetchFollowing = useCallback(() => {
		followingQuery.refetch()
	}, [followingQuery])

	// Handle unfollow action
	const handleUnfollow = useCallback(
		(unfollowedUserId: string) => {
			// Optimistically update local count
			setLocalFollowingCount((prev) => Math.max(0, prev - 1))

			// Invalidate queries
			queryClient.invalidateQueries({ queryKey: queryKey.follow.all })
			queryClient.invalidateQueries({ queryKey: ["user", userId, "following"] })
		},
		[queryClient, userId]
	)

	return (
		<Dialog>
			<DialogTrigger asChild>
				{trigger || (
					<div
						className="flex flex-col p-4 rounded-lg transition-colors hover:bg-primary/5 cursor-pointer"
						onClick={fetchFollowing}
					>
						<span className="text-2xl font-bold">
							{isLoading ? <Skeleton className="h-8 w-8" /> : localFollowingCount}
						</span>
						<span className="text-sm text-muted-foreground">Following</span>
					</div>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-md rounded-lg">
				<DialogHeader>
					<DialogTitle>Following</DialogTitle>
					<DialogDescription>Accounts this user follows</DialogDescription>
				</DialogHeader>
				<ScrollArea className="h-[400px] mt-4 pr-4">
					{followingQuery.isLoading ? (
						<div className="space-y-4">
							{Array(3)
								.fill(0)
								.map((_, index) => (
									<div
										key={userId}
										className="flex items-center gap-4 p-4 rounded-lg border border-border/30"
									>
										<Skeleton className="h-10 w-10 rounded-full" />
										<div className="flex-1">
											<Skeleton className="h-4 w-32 mb-2" />
											<Skeleton className="h-3 w-20" />
										</div>
										<Skeleton className="h-9 w-24" />
									</div>
								))}
						</div>
					) : followingQuery.isError ? (
						<div className="text-center py-12">
							<p className="text-lg text-muted-foreground">Unable to load following list</p>
							<p className="text-sm text-muted-foreground mt-1">
								There was an error loading the accounts this user follows.
							</p>
						</div>
					) : followingQuery.data && followingQuery.data.length > 0 ? (
						<div className="space-y-4">
							{followingQuery.data.map((user) => (
								<div
									key={user.id}
									className="flex items-center gap-4 p-4 rounded-lg border border-border/30 transition-colors hover:bg-primary/5"
								>
									<Avatar>
										<AvatarImage src={user.avatarUrl ?? avatarPlaceholder} />
										<AvatarFallback>{user.userName.charAt(0).toUpperCase()}</AvatarFallback>
									</Avatar>
									<div className="flex-1">
										<p className="font-medium">{firstLetterToUpper(user.userName)}</p>
										<p className="text-sm text-muted-foreground">@{user.userName}</p>
									</div>
									<div onClick={() => handleUnfollow(user.id)}>
										<FollowButton userId={user.id} />
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-12">
							<p className="text-lg text-muted-foreground">Not following anyone yet</p>
							<p className="text-sm text-muted-foreground mt-1">
								When this user follows accounts, they'll appear here.
							</p>
						</div>
					)}
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}
