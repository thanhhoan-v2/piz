"use client"
import { Button } from "@components/ui/Button"
import { Skeleton } from "@components/ui/Skeleton"
import { NotificationItem } from "@components/ui/notification/NotificationItem"
import { useQueryNotifications } from "@queries/client/noti"
import { markAllNotificationsAsRead } from "@queries/server/noti"
import { useUser } from "@stackframe/stack"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKey } from "@utils/queryKeyFactory"
import { Bell, BellOff, RefreshCw } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

export type Noti = {
	id: string
	senderId: string
	receiverId: string
	postId: string | null
	commentId: string | null
	teamId?: string | null
	roomId?: string | null
	notificationType:
		| (
				| "FOLLOW"
				| "POST"
				| "POST_REACTION"
				| "COMMENT"
				| "COMMENT_REACTION"
				| "TEAM_JOIN_REQUEST"
				| "TEAM_JOINED"
				| "TEAM_CREATED"
				| "TEAM_INVITED"
				| "COLLAB_ROOM_JOINED"
				| "COLLAB_ROOM_CREATED"
				| "COLLAB_ROOM_INVITED"
		  )
		| null
	isRead: boolean
	isDeleted: boolean
	createdAt: Date
	updatedAt: Date | null
	metadata?: Record<string, unknown> | null // Additional data specific to notification type
}

export default function NotificationPage() {
	const user = useUser()
	const queryClient = useQueryClient()
	const [isRefreshing, setIsRefreshing] = useState(false)
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const previousNotifications = useRef<any[]>([])

	const {
		data: notifications,
		isSuccess,
		isLoading,
		isError,
		refetch,
	} = useQueryNotifications(user?.id)

	// Check if there are any unread notifications
	const hasUnreadNotifications =
		notifications?.some((notification) => !notification.isRead) || false

	// Mutation to mark all notifications as read
	const markAllReadMutation = useMutation({
		mutationFn: async () => {
			if (!user?.id) return
			return markAllNotificationsAsRead({ userId: user.id })
		},
		onSuccess: () => {
			toast.success("All notifications marked as read")
			queryClient.invalidateQueries({
				queryKey: queryKey.noti.all,
			})
		},
		onError: () => {
			toast.error("Failed to mark notifications as read")
		},
	})

	// Handle manual refresh
	const handleRefresh = async () => {
		setIsRefreshing(true)
		await refetch()
		setIsRefreshing(false)
	}

	useEffect(() => {
		if (isSuccess && notifications) {
			// Store the current notifications for comparison in the next update
			previousNotifications.current = notifications
		}
	}, [notifications, isSuccess])

	return (
		<div className="mx-auto mt-[100px] px-4 py-8 max-w-4xl container">
			<div className="flex justify-between items-center mb-6">
				<h1 className="font-bold text-2xl">Notifications</h1>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleRefresh}
						disabled={isRefreshing || isLoading}
					>
						<RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
						Refresh
					</Button>
					{hasUnreadNotifications && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => markAllReadMutation.mutate()}
							disabled={markAllReadMutation.isPending}
						>
							<BellOff className="mr-2 w-4 h-4" />
							Mark all as read
						</Button>
					)}
				</div>
			</div>

			{isLoading ? (
				<div className="space-y-4">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="flex items-center gap-4 p-4 border border-border rounded-lg">
							<Skeleton className="rounded-full w-10 h-10" />
							<div className="flex-1 space-y-2">
								<Skeleton className="w-3/4 h-4" />
								<Skeleton className="w-1/4 h-3" />
							</div>
						</div>
					))}
				</div>
			) : isError ? (
				<div className="py-12 border border-border rounded-lg text-center">
					<p className="mb-2 text-red-500">Failed to load notifications</p>
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						Try again
					</Button>
				</div>
			) : notifications && notifications.length > 0 ? (
				<div className="space-y-6">
					{/* Group notifications by read status */}
					{hasUnreadNotifications && (
						<div>
							<h2 className="mb-2 px-2 font-medium text-muted-foreground text-sm">New</h2>
							<div className="space-y-2 bg-background-item/20 p-2 rounded-lg">
								{notifications
									.filter((notification) => !notification.isRead)
									.map((notification) => (
										<NotificationItem key={notification.id} notification={notification} />
									))}
							</div>
						</div>
					)}

					{/* Read notifications */}
					{notifications.some((notification) => notification.isRead) && (
						<div>
							<h2 className="mb-2 px-2 font-medium text-muted-foreground text-sm">Earlier</h2>
							<div className="space-y-2">
								{notifications
									.filter((notification) => notification.isRead)
									.map((notification) => (
										<NotificationItem key={notification.id} notification={notification} />
									))}
							</div>
						</div>
					)}
				</div>
			) : (
				<div className="py-12 border border-border rounded-lg text-center">
					<Bell className="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
					<p className="font-medium text-lg">No notifications yet</p>
					<p className="mt-1 text-muted-foreground">
						When you get notifications, they'll appear here
					</p>
				</div>
			)}
		</div>
	)
}
