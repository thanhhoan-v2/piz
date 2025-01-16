"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/Avatar"
import { cn } from "@utils/cn"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import type { Route } from 'next'
import { getNotificationMessage, Noti } from "@app/activity/page"
import React from "react"
import { getUserById } from "@app/actions/user"

export type SenderInfo = {
    userName: string
    avatarUrl: string
}

export function NotificationItem({ notification }: { notification: Noti }) {
    const [senderInfo, setSenderInfo] = React.useState<SenderInfo>()

    React.useEffect(() => {
        const fetchUserInfo = async () => {
            if (notification.senderId) {
                const fetchedSenderInfo = await getUserById(notification.senderId)
                setSenderInfo(fetchedSenderInfo)
            }
        }
        fetchUserInfo()
    }, [notification.senderId])

    return (
        <Link
            href={getNotificationLink(notification)}
            className={cn(
                "flex items-center gap-4 p-4 rounded-lg hover:bg-background-item/80 w-[70vw]",
                !notification.isRead && "bg-background-item"
            )}
        >
            <Avatar>
                <AvatarImage src={senderInfo?.avatarUrl} />
                <AvatarFallback>
                    {senderInfo?.userName?.[0].toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p>{getNotificationMessage(notification, senderInfo)}</p>
                <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
            </div>
        </Link>
    )
}

function getNotificationLink(notification: Noti): Route {
    const senderIdRoute = `/${notification.senderId}` as Route
    const postIdRoute = `${senderIdRoute}/post/${notification.postId}` as Route
    const commentIdRoute = `${postIdRoute}/comment/${notification.commentId}` as Route

    switch (notification.notificationType) {
        case "FOLLOW":
            return senderIdRoute
        case "COMMENT":
            return commentIdRoute
        case "COMMENT_REACTION":
            return commentIdRoute
        case "POST":
            return postIdRoute
        case "POST_REACTION":
            return postIdRoute
        default:
            return "/" as Route
    }
} 