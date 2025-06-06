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
import { useQueryClient } from "@tanstack/react-query"
import { avatarPlaceholder } from "@utils/image.helpers"
import { queryKey } from "@utils/queryKeyFactory"
import { firstLetterToUpper } from "@utils/string.helpers"
import { useCallback } from "react"
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
	const handleFollowAction = useCallback(() => {
		// Invalidate following-related queries to update UI
		queryClient.invalidateQueries({ queryKey: queryKey.follow.all })
		queryClient.invalidateQueries({ queryKey: ["user", userId, "following"] })
	}, [queryClient, userId])

	return (
		<Dialog>
			<DialogTrigger asChild>
				{trigger || (
					<div
						className="flex flex-col hover:bg-primary/5 p-4 rounded-lg transition-colors cursor-pointer"
						onClick={fetchFollowers}
					>
						<span className="font-bold text-2xl">
							{isLoading ? <Skeleton className="w-8 h-8" /> : followersCount}
						</span>
						<span className="text-muted-foreground text-sm">Followers</span>
					</div>
				)}
			</DialogTrigger>
			<DialogContent className="rounded-lg sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Followers</DialogTitle>
					<DialogDescription>People who follow this account</DialogDescription>
				</DialogHeader>
				<ScrollArea className="mt-4 pr-4 h-[400px]">
					{followersQuery.isLoading ? (
						<div className="space-y-4">
							{Array(3)
								.fill(0)
								.map((_, i) => (
									<div
										key={`skeleton-${i}`}
										className="flex items-center gap-4 p-4 border border-border/30 rounded-lg"
									>
										<Skeleton className="rounded-full w-10 h-10" />
										<div className="flex-1">
											<Skeleton className="mb-2 w-32 h-4" />
											<Skeleton className="w-20 h-3" />
										</div>
										<Skeleton className="w-24 h-9" />
									</div>
								))}
						</div>
					) : followersQuery.isError ? (
						<div className="py-12 text-center">
							<p className="text-muted-foreground text-lg">Unable to load followers</p>
							<p className="mt-1 text-muted-foreground text-sm">
								There was an error loading the followers list.
							</p>
						</div>
					) : followersQuery.data && followersQuery.data.length > 0 ? (
						<div className="space-y-4">
							{followersQuery.data.map((follower) => (
								<div
									key={follower.id}
									className="flex items-center gap-4 hover:bg-primary/5 p-4 border border-border/30 rounded-lg transition-colors"
								>
									<Avatar>
										<AvatarImage src={follower.avatarUrl ?? avatarPlaceholder} />
										<AvatarFallback>{follower.userName.charAt(0).toUpperCase()}</AvatarFallback>
									</Avatar>
									<div className="flex-1">
										<p className="font-medium">{firstLetterToUpper(follower.userName)}</p>
										<p className="text-muted-foreground text-sm">@{follower.userName}</p>
									</div>
									<div onClick={handleFollowAction}>
										<FollowButton userId={follower.id} />
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="py-12 text-center">
							<p className="text-muted-foreground text-lg">No followers yet</p>
							<p className="mt-1 text-muted-foreground text-sm">
								When people follow this account, they'll appear here.
							</p>
						</div>
					)}
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}
