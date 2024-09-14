"use client"

import { Avatar, AvatarImage } from "@components/ui/Avatar"
import type { NotificationType } from "@prisma/client"
import { useQueryAppUser } from "@queries/client/appUser"
import { useQueryAllNotifications } from "@queries/client/noti"
import { avatarPlaceholder } from "@utils/image.helpers"

const notiMap: Record<string, string> = {
	FOLLOW: "followed",
	FOLLOW_SUGGEST: "should follow",
	COMMENT: "commented",
	TAG: "tagged",
	REACT: "reacted",
}

export default function ActivityPage() {
	const {
		data: user,
		isLoading: isUserLoading,
		isError: isUserError,
	} = useQueryAppUser()

	const {
		data: notiList,
		isLoading,
		isSuccess,
		isError,
		isFetching,
	} = useQueryAllNotifications({ userId: user?.id })

	if (isUserError) return <div>Error fetching your information 😢</div>
	if (isUserLoading) return <div>Fetching your information...</div>

	if (isError) return <div>Error loading activities 😢</div>
	if (isLoading || isFetching) return <div>Loading activities...</div>

	if (isSuccess)
		return (
			<>
				<div className="flex-col gap-3">
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
