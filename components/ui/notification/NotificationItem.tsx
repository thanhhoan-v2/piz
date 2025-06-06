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
import {
	formatNotificationTime,
	getNotificationIcon,
	getNotificationLink,
	getNotificationMessage,
} from "@utils/notification.helpers"
import { queryKey } from "@utils/queryKeyFactory"
import {
	Check,
	Code,
	FileText,
	Heart,
	Loader2,
	MessageSquare,
	MoreHorizontal,
	Trash2,
	UserPlus,
	Users,
} from "lucide-react"
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

	// Get the appropriate icon based on notification type
	const getIconComponent = () => {
		const iconName = getNotificationIcon(notification)
		switch (iconName) {
			case "user-plus":
				return <UserPlus className="w-4 h-4 text-blue-500" />
			case "message-square":
				return <MessageSquare className="w-4 h-4 text-green-500" />
			case "heart":
				return <Heart className="w-4 h-4 text-red-500" />
			case "file-text":
				return <FileText className="w-4 h-4 text-purple-500" />
			case "users":
				return <Users className="w-4 h-4 text-indigo-500" />
			case "code":
				return <Code className="w-4 h-4 text-amber-500" />
			default:
				return null
		}
	}

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
				"flex items-center gap-4 rounded-lg p-4 border bg-cynical-black border-transparent hover:bg-background-item/80 transition-colors relative",
				!notification.isRead && "bg-cynical-black/60 border-border/50"
			)}
		>
			{!notification.isRead && (
				<div className="top-0 bottom-0 left-0 absolute bg-primary rounded-l-lg w-1" />
			)}

			<div
				className="flex flex-1 items-center gap-4 cursor-pointer"
				onClick={handleNotificationClick}
			>
				<div className="relative">
					<Avatar>
						<AvatarImage src={senderInfo?.userAvatarUrl} />
						<AvatarFallback>{senderInfo?.userName?.[0].toUpperCase()}</AvatarFallback>
					</Avatar>
					<div className="-right-1 -bottom-1 absolute flex justify-center items-center bg-gray-100 dark:bg-gray-800 border-2 border-background rounded-full w-6 h-6">
						{getIconComponent()}
					</div>
					{!notification.isRead && (
						<div className="-top-1 -right-1 absolute bg-primary border-2 border-background rounded-full w-3 h-3" />
					)}
				</div>
				<div className="flex-1">
					<p className={cn("font-medium", !notification.isRead && "text-white/80")}>
						{getNotificationMessage(notification, senderInfo)}
					</p>
					<p className="text-muted-foreground text-sm">
						{formatNotificationTime(notification.createdAt)}
					</p>
				</div>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-2">
				{!notification.isRead && (
					<Button
						size="icon"
						variant="outline"
						className="hover:bg-primary/10 border-primary w-8 h-8 text-primary"
						onClick={(e) => {
							e.stopPropagation()
							markAsReadMutation.mutate()
						}}
						disabled={markAsReadMutation.isPending}
					>
						{markAsReadMutation.isPending ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<Check className="w-4 h-4" />
						)}
					</Button>
				)}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							size="icon"
							variant="ghost"
							className="w-8 h-8"
							onClick={(e) => e.stopPropagation()}
						>
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
