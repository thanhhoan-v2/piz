"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/Avatar"
import { cn } from "@utils/cn"
import { avatarPlaceholder } from "@utils/image.helpers"
import { firstLetterToUpper } from "@utils/string.helpers"
import Link from "next/link"

export type SearchResultProps = Array<{
	id: string
	userName: string
	avatarUrl?: string | null
}>

interface SearchListProps {
	searchResults: SearchResultProps
	appUserId?: string
	isMention?: boolean
	containerClassname?: string
	onSearchResultClick?: (id: string, userName: string) => void
}

export default function SearchList({
	searchResults,
	appUserId,
	isMention = false,
	containerClassname,
	onSearchResultClick,
}: SearchListProps) {
	return (
		<div className={cn("my-4 flex-col gap-2", containerClassname)}>
			{searchResults.map((result) => (
				isMention ? (
					<div
						key={result.id}
						className={cn(
							"flex-between rounded-lg bg-background-item p-4 hover:bg-background-item/80 cursor-pointer"
						)}
						onClick={() => onSearchResultClick?.(result.id, result.userName)}
					>
						<ResultContent result={result} appUserId={appUserId} />
					</div>
				) : (
					<Link key={result.id} href={`/${result.id}`}>
						<div className="flex-between rounded-lg bg-background-item p-4 hover:bg-background-item/80">
							<ResultContent result={result} appUserId={appUserId} />
						</div>
					</Link>
				)
			))}
		</div>
	)
}

function ResultContent({ result, appUserId }: { result: SearchResultProps[0], appUserId?: string }) {
	return (
		<>
			<div className="flex-y-center gap-4">
				<Avatar>
					<AvatarImage src={result.avatarUrl ?? avatarPlaceholder} />
					<AvatarFallback>
						{firstLetterToUpper(result.userName)}
					</AvatarFallback>
				</Avatar>
				<span>{result.userName}</span>
			</div>
			{result.id === appUserId && (
				<span className="text-sm text-muted-foreground">You</span>
			)}
		</>
	)
}
