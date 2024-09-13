import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/Avatar"
import { avatarPlaceholder } from "@utils/image.helpers"
import { getTimeDiffStatus } from "@utils/time.helpers"
import { CircleUserRound } from "lucide-react"
import type { Route } from "next"
import Link from "next/link"
import type { PostVisibilityEnumType } from "../form/PostForm"
import PostVisibilityBadge from "./PostVisibilityBadge"

export type PostUserInfoProps = {
	userAvatarUrl: string | null
	userName: string | null
	content?: string
	visibility?: PostVisibilityEnumType
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
	isWriteOnly, // If the post is write-only, then hide the time diff
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
								{appUserName === userName && (
									<CircleUserRound className="size-4" />
								)}
							</Link>
							<p className="text-slate-500 text-sm italic">
								{!isWriteOnly && getTimeDiffStatus(createdAt, updatedAt)}
							</p>
						</div>
						{visibility && <PostVisibilityBadge visibility={visibility} />}
					</div>
					<div className="flex flex-col gap-4">
						<div className="whitespace-pre-wrap text-wrap-pretty">
							{content}
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
