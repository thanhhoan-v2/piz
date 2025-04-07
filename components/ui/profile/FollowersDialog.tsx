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
import { useQueryUserFollowers } from "@queries/client/follow"
import { avatarPlaceholder } from "@utils/image.helpers"
import { firstLetterToUpper } from "@utils/string.helpers"
import { queryKey } from "@utils/queryKeyFactory"
import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import FollowButton from "./FollowButton"

// Using FollowerUser interface from '@queries/client/follow'

interface FollowersDialogProps {
	userId: string
	followersCount: number
	isLoading?: boolean
	trigger?: React.ReactNode
}

export default function FollowersDialog({
	userId,
	followersCount,
	isLoading = false,
	trigger,
}: FollowersDialogProps) {
	const queryClient = useQueryClient()
	const followersQuery = useQueryUserFollowers(userId)

	const fetchFollowers = useCallback(() => {
		followersQuery.refetch()
	}, [followersQuery])

	// Handle follow/unfollow to update counts and UI
	const handleFollowAction = useCallback((followedUserId: string) => {
		// Invalidate following-related queries to update UI
		queryClient.invalidateQueries({ queryKey: queryKey.follow.all })
		queryClient.invalidateQueries({ queryKey: ["user", userId, "following"] })
	}, [queryClient, userId])

	return (
		<Dialog>
			<DialogTrigger asChild>
				{trigger || (
					<div
						className="flex flex-col p-4 rounded-lg transition-colors hover:bg-primary/5 cursor-pointer"
						onClick={fetchFollowers}
					>
						<span className="text-2xl font-bold">
							{isLoading ? <Skeleton className="h-8 w-8" /> : followersCount}
						</span>
						<span className="text-sm text-muted-foreground">Followers</span>
					</div>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-md rounded-lg">
				<DialogHeader>
					<DialogTitle>Followers</DialogTitle>
					<DialogDescription>People who follow this account</DialogDescription>
				</DialogHeader>
				<ScrollArea className="h-[400px] mt-4 pr-4">
					{followersQuery.isLoading ? (
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
					) : followersQuery.isError ? (
						<div className="text-center py-12">
							<p className="text-lg text-muted-foreground">Unable to load followers</p>
							<p className="text-sm text-muted-foreground mt-1">
								There was an error loading the followers list.
							</p>
						</div>
					) : followersQuery.data && followersQuery.data.length > 0 ? (
						<div className="space-y-4">
							{followersQuery.data.map((follower) => (
								<div
									key={follower.id}
									className="flex items-center gap-4 p-4 rounded-lg border border-border/30 transition-colors hover:bg-primary/5"
								>
									<Avatar>
										<AvatarImage src={follower.avatarUrl ?? avatarPlaceholder} />
										<AvatarFallback>{follower.userName.charAt(0).toUpperCase()}</AvatarFallback>
									</Avatar>
									<div className="flex-1">
										<p className="font-medium">{firstLetterToUpper(follower.userName)}</p>
										<p className="text-sm text-muted-foreground">@{follower.userName}</p>
									</div>
									<div onClick={() => handleFollowAction(follower.id)}>
										<FollowButton userId={follower.id} variant="secondary" size="sm" />
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-12">
							<p className="text-lg text-muted-foreground">No followers yet</p>
							<p className="text-sm text-muted-foreground mt-1">
								When people follow this account, they'll appear here.
							</p>
						</div>
					)}
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}
