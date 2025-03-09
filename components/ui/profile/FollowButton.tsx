"use client"
import { Button } from "@components/ui/Button"
import { createFollow, deleteFollow, getFollow } from "@queries/server/follow"
import { useUser } from "@stackframe/stack"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKey } from "@utils/queryKeyFactory"
import { UserMinus2, UserPlus2 } from "lucide-react"
import { toast } from "sonner"

export default function FollowButton({ userId }: { userId: string }) {
	const user = useUser()
	const queryClient = useQueryClient()

	// Check if already following
	const { data: followData } = useQuery({
		queryKey: queryKey.follow.selectFollower(user?.id ?? ""),
		queryFn: () => getFollow({ followerId: user?.id ?? "", followeeId: userId }),
		enabled: !!user?.id,
	})

	const followMutation = useMutation({
		mutationFn: async () => {
			if (!user?.id) throw new Error("Not authenticated")
			return followData
				? deleteFollow({ followerId: user.id, followeeId: userId })
				: createFollow({ followerId: user.id, followeeId: userId })
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

	if (user?.id === userId) return null

	return (
		<Button
			onClick={() => followMutation.mutate()}
			disabled={followMutation.isPending}
			variant={followData ? "secondary" : "default"}
			className="gap-2"
		>
			{followData ? (
				<>
					<UserMinus2 className="h-4 w-4" />
					Following
				</>
			) : (
				<>
					<UserPlus2 className="h-4 w-4" />
					Follow
				</>
			)}
		</Button>
	)
}
