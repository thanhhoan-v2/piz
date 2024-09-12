import { Avatar, AvatarImage } from "@components/ui/Avatar"
import FollowButton from "@components/ui/button/FollowButton"
import { avatarPlaceholder } from "@utils/image.helpers"
import type { Route } from "next"
import Link from "next/link"

export type SearchResultProps = {
	id: string
	fullName: string
	userName: string
	avatarUrl: string | null
}[]

type SearchListProps = {
	appUserId?: string | null
	searchResults: SearchResultProps | null
}

export default function SearchList({
	searchResults,
	appUserId,
}: SearchListProps) {
	return (
		<>
			<div className="my-4 w-full flex-col gap-3">
				{searchResults?.map(({ id, userName, fullName, avatarUrl }) => (
					<>
						<div
							key={id}
							className="flex h-full w-full flex-between flex-y-center gap-3"
						>
							<Link
								href={`/${userName}` as Route}
								className="flex-auto gap-3 rounded-lg bg-background-item px-4 py-2"
							>
								<div className="flex-y-center gap-5">
									<Avatar>
										<AvatarImage
											src={avatarUrl ?? avatarPlaceholder}
											alt={userName}
										/>
									</Avatar>
									<div className="flex-col gap-1">
										<p className="font-bold">{userName}</p>
										<p className="text-gray-400">{fullName}</p>
									</div>
								</div>
							</Link>

							{appUserId && (
								<FollowButton
									className="h-[70px] w-[100px]"
									followerId={appUserId}
									followeeId={id}
								/>
							)}
						</div>
					</>
				))}
			</div>
		</>
	)
}
