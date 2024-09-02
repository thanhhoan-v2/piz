import { Avatar, AvatarImage } from "@components/atoms/avatar"
import { avatarPlaceholder } from "@constants/image-placeholder"
import type { NotificationType } from "@prisma/client"
import { prisma } from "@prisma/functions/client"

const notiMap: Record<NotificationType, string> = {
	FOLLOW: "followed",
	FOLLOW_SUGGEST: "should follow",
	COMMENT: "commented",
	TAG: "tagged",
	REACT: "reacted",
}

export default async function ActivityPage() {
	const notiList = await prisma.notification.findMany({
		where: { receiverId: "591e457a-5bb6-4c45-829b-7affa3faab1d" },
		include: {
			sender: {
				select: {
					id: true,
					userName: true,
					avatarUrl: true,
				},
			},
		},
	})

	return (
		<>
			<div className="flex-col gap-3">
				{notiList.map((noti) => {
					return (
						<div
							key={noti.id}
							className="w-[600px] flex-y-center gap-1 rounded-lg bg-background-item p-6"
						>
							<div className="flex-y-center gap-3">
								<Avatar>
									<AvatarImage
										src={noti.sender?.avatarUrl ?? avatarPlaceholder}
									/>
								</Avatar>
								<p>{noti.sender?.userName}</p>
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
