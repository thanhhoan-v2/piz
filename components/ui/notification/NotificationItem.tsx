"use client"
import { getUserById } from "@app/actions/user"
import type { Noti } from "@app/notification/page"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/Avatar"
import { Button } from "@components/ui/Button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@components/ui/DropdownMenu"
import { Skeleton } from "@components/ui/Skeleton"
import { deleteNotification, markNotificationAsRead } from "@queries/server/noti"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@utils/cn"
import { getNotificationLink, getNotificationMessage } from "@utils/notification.helpers"
import { queryKey } from "@utils/queryKeyFactory"
import { formatDistanceToNow } from "date-fns"
import { Check, MoreHorizontal, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react"
import { toast } from "sonner"

export type SenderInfo = {
	userName: string
	userAvatarUrl: string
}

export function NotificationItem({ notification }: { notification: Noti }) {
	const [senderInfo, setSenderInfo] = React.useState<SenderInfo>()
	const [isLoading, setIsLoading] = React.useState(true)
	const router = useRouter()
	const queryClient = useQueryClient()

	React.useEffect(() => {
		const fetchUserInfo = async () => {
			setIsLoading(true)
			try {
				if (notification.senderId) {
					const fetchedSenderInfo = await getUserById(notification.senderId)
					setSenderInfo(fetchedSenderInfo)
				}
			} catch (error) {
				console.error("Error fetching sender info:", error)
			} finally {
				setIsLoading(false)
			}
		}
		fetchUserInfo()
	}, [notification.senderId])

	// Mark as read mutation
	const markAsReadMutation = useMutation({
		mutationFn: async () => {
			return markNotificationAsRead({ notificationId: notification.id })
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKey.noti.all,
			})
		},
	})

	// Delete notification mutation
	const deleteNotificationMutation = useMutation({
		mutationFn: async () => {
			return deleteNotification({ notificationId: notification.id })
		},
		onSuccess: () => {
			toast.success("Notification removed")
			queryClient.invalidateQueries({
				queryKey: queryKey.noti.all,
			})
		},
		onError: () => {
			toast.error("Failed to remove notification")
		},
	})

	// Handle notification click
	const handleNotificationClick = () => {
		// Mark as read when clicked
		if (!notification.isRead) {
			markAsReadMutation.mutate()
		}
		// Navigate to the notification target
		router.push(getNotificationLink(notification))
	}

	if (isLoading) {
		return (
			<div className="flex items-center gap-4 p-4 border border-border rounded-lg">
				<Skeleton className="rounded-full w-10 h-10" />
				<div className="flex-1 space-y-2">
					<Skeleton className="w-3/4 h-4" />
					<Skeleton className="w-1/4 h-3" />
				</div>
			</div>
		)
	}

	return (
		<div
			className={cn(
				"flex items-center gap-4 rounded-lg p-4 border border-transparent hover:bg-background-item/80 transition-colors",
				!notification.isRead && "bg-background-item border-border/50",
			)}
		>
			<div
				className="flex flex-1 items-center gap-4 cursor-pointer"
				onClick={handleNotificationClick}
			>
				<Avatar>
					<AvatarImage src={senderInfo?.userAvatarUrl} />
					<AvatarFallback>{senderInfo?.userName?.[0].toUpperCase()}</AvatarFallback>
				</Avatar>
				<div className="flex-1">
					<p className="font-medium">{getNotificationMessage(notification, senderInfo)}</p>
					<p className="text-muted-foreground text-sm">
						{formatDistanceToNow(new Date(notification.createdAt), {
							addSuffix: true,
						})}
					</p>
				</div>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-2">
				{!notification.isRead && (
					<Button
						size="icon"
						variant="ghost"
						className="w-8 h-8"
						onClick={() => markAsReadMutation.mutate()}
						disabled={markAsReadMutation.isPending}
					>
						<Check className="w-4 h-4" />
					</Button>
				)}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="icon" variant="ghost" className="w-8 h-8">
							<MoreHorizontal className="w-4 h-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{!notification.isRead && (
							<DropdownMenuItem onClick={() => markAsReadMutation.mutate()}>
								<Check className="mr-2 w-4 h-4" />
								Mark as read
							</DropdownMenuItem>
						)}
						<DropdownMenuItem
							onClick={() => deleteNotificationMutation.mutate()}
							className="text-red-500 focus:text-red-500"
						>
							<Trash2 className="mr-2 w-4 h-4" />
							Remove
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	)
}
