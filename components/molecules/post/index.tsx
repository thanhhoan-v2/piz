import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@components/atoms/avatar"
import { Badge } from "@components/atoms/badge"
import { Button } from "@components/atoms/button"
import { ROUTE } from "@constants/route"
import type { PostProps } from "@prisma/global"
import { cn } from "@utils/cn"
import { Ellipsis, Forward, Heart, MessageSquare } from "lucide-react"
import type { Route } from "next"
import Link from "next/link"

export default function Post({
	id,
	userName,
	userAvatarUrl,
	content,
	noShares,
	visibility,
	createdAt,
	updatedAt,
	isDeleted,
}: PostProps) {
	const currentTime = new Date()
	const givenTime = updatedAt ?? createdAt

	// Calculate the difference in milliseconds
	const differenceInMilliseconds =
		currentTime.getTime() - givenTime.getTime()

	// Convert milliseconds to seconds, minutes, hours, days
	const seconds = Math.floor(differenceInMilliseconds / 1000)
	const minutes = Math.floor(differenceInMilliseconds / (1000 * 60))
	const hours = Math.floor(
		differenceInMilliseconds / (1000 * 60 * 60),
	)
	const days = Math.floor(
		differenceInMilliseconds / (1000 * 60 * 60 * 24),
	)

	let timeAgo = `${seconds} seconds ago`
	if (seconds > 60) {
		timeAgo = `${minutes} minutes ago`
	}
	if (minutes > 60) {
		timeAgo = `${hours} hours ago`
	}
	if (hours > 24) {
		timeAgo = `${days} days ago`
	}

	if (isDeleted) return null

	return (
		<>
			<div className="flex min-h-[100px] flex-col justify-between px-5 py-3">
				<div className="flex justify-between">
					<div className="flex items-start gap-3">
						<Avatar className="h-12 w-12">
							<AvatarImage
								src={userAvatarUrl ?? ""}
								alt="User Avatar"
							/>
							<AvatarFallback>PIZ</AvatarFallback>
						</Avatar>

						<div className="flex flex-col gap-2">
							<div>
								<div className="flex-y-center gap-4">
									<Link
										href={cn(ROUTE.HOME, userName) as Route}
										className="font-bold hover:underline hover:decoration-wavy hover:underline-offset-2"
									>
										{userName}
									</Link>
									<p className="text-slate-500 text-sm">{timeAgo}</p>
								</div>
							</div>
							<div className="flex flex-col gap-4">
								<Badge className="w-fit" variant="outline">
									{visibility}
								</Badge>
								<div className="whitespace-pre-wrap">{content}</div>
							</div>
						</div>
					</div>

					<div>
						<Ellipsis />
					</div>
				</div>

				<div className="mx-2 my-4 flex gap-2">
					<Button variant="outline" className="flex gap-2">
						<Heart />
						<span>3</span>
					</Button>
					<Button variant="outline" className="flex gap-2">
						<MessageSquare />
						<span>9</span>
					</Button>
					<Button variant="outline" className="flex gap-2">
						<Forward />
						<span>{noShares}</span>
					</Button>
				</div>
			</div>
		</>
	)
}
