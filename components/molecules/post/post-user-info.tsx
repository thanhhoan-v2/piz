import { Avatar, AvatarFallback, AvatarImage } from "@components/atoms/avatar"
import PostVisibilityBadge from "@components/molecules/post/post-visibility-badge"
import { avatarPlaceholder } from "@constants/image-placeholder"
import type { PrismaPostVisibilityEnum } from "@prisma/global"
import { calculateTimeDiff } from "@utils/time.helpers"
import { Sparkles } from "lucide-react"
import type { Route } from "next"
import Link from "next/link"

type PostUserInfoProps = {
	userAvatarUrl: string | null
	userName: string | null
	content?: string
	visibility: PrismaPostVisibilityEnum
	createdAt: Date
	updatedAt: Date | null
	appUserName?: string | null
	isWriteOnly?: boolean
}

export default function PostUserInfo({
	userAvatarUrl,
	userName,
	content,
	visibility,
	createdAt,
	updatedAt,
	appUserName,
	isWriteOnly,
}: PostUserInfoProps) {
	return (
		<>
			<div className="flex items-start gap-3">
				<Avatar className="size-8">
					<AvatarImage
						src={userAvatarUrl ?? avatarPlaceholder}
						alt="User Avatar"
					/>
					<AvatarFallback>PIZ</AvatarFallback>
				</Avatar>

				<div className="flex flex-col gap-2">
					<div>
						<div className="flex-y-center gap-4">
							<Link
								href={`/${userName}` as Route}
								className="flex items-center gap-2 font-bold hover:underline hover:decoration-wavy hover:underline-offset-2"
							>
								<p>{userName}</p>
								{appUserName === userName && <Sparkles className="size-4" />}
							</Link>
							<p className="text-slate-500 text-sm italic">
								{!isWriteOnly && calculateTimeDiff(createdAt, updatedAt)}
							</p>
						</div>
						<PostVisibilityBadge visibility={visibility} />
					</div>
					<div className="flex flex-col gap-4">
						<div className="whitespace-pre-wrap">{content}</div>
					</div>
				</div>
			</div>
		</>
	)
}
