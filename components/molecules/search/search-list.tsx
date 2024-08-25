import { Avatar, AvatarImage } from "@components/atoms/avatar"
import FollowButton from "@components/molecules/button/follow-button"
import { avatarPlaceholder } from "@constants/image-placeholder"
import type { AppUserProps } from "@prisma/global"
import type { Route } from "next"
import Link from "next/link"

type SearchListProps = {
	searchResults: AppUserProps[]
	appUserId: string | null
}

export default function SearchList({
	searchResults,
	appUserId,
}: SearchListProps) {
	return (
		<>
			<div className="my-4 w-full flex-col gap-3">
				{searchResults?.map(({ id, userName, fullName, avatarUrl }) => (
					<Link href={`/${userName}` as Route} key={id}>
						<div className="flex-between flex-y-center gap-3 rounded-lg bg-background-item px-4 py-2">
							<div className="flex-y-center gap-3">
								<Avatar>
									<AvatarImage
										src={avatarUrl ?? avatarPlaceholder}
										alt={userName}
									/>
								</Avatar>
								<div className="flex-col">
									<p className="font-bold">{userName}</p>
									<p className="text-gray-400">{fullName}</p>
								</div>
							</div>

							{appUserId && (
								<FollowButton followerId={appUserId} followeeId={id} />
							)}
						</div>
					</Link>
				))}
			</div>
		</>
	)
}
