"use client"

import { Avatar, AvatarImage } from "@components/ui/Avatar"
import type { NotificationType } from "@prisma/client"
import { useQueryAppUser } from "@queries/client/appUser"
import { useQueryAllNotifications } from "@queries/client/noti"
import { useUser } from "@stackframe/stack"
import { avatarPlaceholder } from "@utils/image.helpers"

const notiMap: Record<string, string> = {
	FOLLOW: "followed",
	FOLLOW_SUGGEST: "should follow",
	COMMENT: "commented",
	TAG: "tagged",
	REACT: "reacted",
}

/**
 * Page showing all the activities of the user.
 *
 * It fetches the list of notifications for the user and displays each one
 * as a card with the sender's avatar, the sender's username, the type of
 * notification, and the text "you".
 *
 * If there is an error fetching the user's information, it displays an error
 * message. If there is an error loading the activities, it displays an error
 * message. If the activities are loading, it displays a loading message.
 *
 * Otherwise, it displays a list of all the user's activities.
 */
export default function ActivityPage() {
	const user = useUser()

	const {
		data: notiList,
		isLoading,
		isSuccess,
		isError,
		isFetching,
	} = useQueryAllNotifications({ userId: user?.id })

	if (isError) return <div>Error loading activities 😢</div>
	if (isLoading || isFetching) return <div>Loading activities...</div>

	if (isSuccess)
		return (
			<>
				<div className="mt-[100px] flex-col gap-3">
					{notiList?.map((noti) => {
						return (
							<div
								key={noti.id}
								className="w-[600px] flex-y-center gap-1 rounded-lg bg-background-item p-6"
							>
								<div className="flex-y-center gap-3">
									<Avatar>
										<AvatarImage
											src={noti?.sender?.avatarUrl ?? avatarPlaceholder}
										/>
									</Avatar>
									<p>{noti?.sender?.userName}</p>
								</div>
								<div>
									<p>{notiMap[noti.notificationType as NotificationType]}</p>
								</div>
								<div>
									<p>you</p>
								</div>
							</div>
						)
					})}
				</div>
			</>
		)
}
