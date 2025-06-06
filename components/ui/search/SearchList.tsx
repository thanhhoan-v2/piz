"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/Avatar"
import { Button } from "@components/ui/Button"
import { createFollow, deleteFollow, getFollow } from "@queries/server/follow"
import { useUser } from "@stackframe/stack"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { cn } from "@utils/cn"
import { avatarPlaceholder } from "@utils/image.helpers"
import { queryKey } from "@utils/queryKeyFactory"
import { firstLetterToUpper } from "@utils/string.helpers"
import { Loader2, UserMinus2, UserPlus2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export type SearchResultProps = Array<{
	id: string
	userName: string
	avatarUrl?: string | null
}>

interface SearchListProps {
	searchResults: SearchResultProps
	appUserId?: string
	isMention?: boolean
	containerClassname?: string
	onSearchResultClick?: (id: string, userName: string) => void
}

export default function SearchList({
	searchResults,
	appUserId,
	isMention = false,
	containerClassname,
	onSearchResultClick,
}: SearchListProps) {
	return (
		<div className={cn("my-4 flex-col gap-2", containerClassname)}>
			{searchResults.map((result) =>
				isMention ? (
					<div
						key={result.id}
						className={cn(
							"flex-between cursor-pointer rounded-lg bg-background-item p-4 hover:bg-background-item/80"
						)}
						onClick={() => onSearchResultClick?.(result.id, result.userName)}
					>
						<UserInfo result={result} />
						<FollowButtonSection result={result} appUserId={appUserId} />
					</div>
				) : (
					<div
						key={result.id}
						className="flex-between bg-background-item hover:bg-background-item/80 p-4 rounded-lg"
					>
						<Link href={`/${result.id}`} className="flex-1">
							<UserInfo result={result} />
						</Link>
						<FollowButtonSection result={result} appUserId={appUserId} />
					</div>
				)
			)}
		</div>
	)
}

// Separate component for user info
function UserInfo({ result }: { result: SearchResultProps[0] }) {
	return (
		<div className="flex-y-center gap-4">
			<Avatar>
				<AvatarImage src={result.avatarUrl ?? avatarPlaceholder} />
				<AvatarFallback>{firstLetterToUpper(result.userName)}</AvatarFallback>
			</Avatar>
			<span>{result.userName}</span>
		</div>
	)
}

// Separate component for follow button
function FollowButtonSection({
	result,
	appUserId,
}: {
	result: SearchResultProps[0]
	appUserId?: string
}) {
	const user = useUser()
	const queryClient = useQueryClient()
	const currentUserId = user?.id

	// Don't show follow button for yourself
	const showFollowButton = currentUserId && result.id !== currentUserId

	// Check if already following
	const { data: followData, isLoading: isCheckingFollow } = useQuery({
		queryKey: queryKey.follow.selectFollower(currentUserId || ""),
		queryFn: () => getFollow({ followerId: currentUserId || "", followeeId: result.id }),
		enabled: Boolean(currentUserId && showFollowButton),
	})

	const followMutation = useMutation({
		mutationFn: async () => {
			if (!currentUserId) throw new Error("Not authenticated")
			return followData
				? deleteFollow({ followerId: currentUserId, followeeId: result.id })
				: createFollow({ followerId: currentUserId, followeeId: result.id })
		},
		onSuccess: () => {
			toast(followData ? "You unfollowed this user" : "You are now following this user")
			queryClient.invalidateQueries({
				queryKey: queryKey.follow.all,
			})
		},
		onError: () => {
			toast(`Failed to ${followData ? "unfollow" : "follow"} user`)
		},
	})

	return (
		<div className="flex items-center gap-2">
			{result.id === appUserId && <span className="text-muted-foreground text-sm">You</span>}
			{showFollowButton && (
				<Button
					size="sm"
					onClick={(e) => {
						e.preventDefault() // Prevent navigation when clicking the button
						e.stopPropagation() // Stop event from bubbling up to parent
						followMutation.mutate()
					}}
					disabled={followMutation.isPending || isCheckingFollow}
					variant={followData ? "secondary" : "default"}
					className="gap-1 px-3 h-8"
				>
					{followMutation.isPending ? (
						<Loader2 className="w-3 h-3 animate-spin" />
					) : followData ? (
						<>
							<UserMinus2 className="w-3 h-3" />
							<span className="text-xs">Following</span>
						</>
					) : (
						<>
							<UserPlus2 className="w-3 h-3" />
							<span className="text-xs">Follow</span>
						</>
					)}
				</Button>
			)}
		</div>
	)
}
