import { Badge } from "@components/atoms/badge"
import { PostVisibility } from "@prisma/client"
import type { PostVisibilityEnumType } from "@prisma/global"
import { cn } from "@utils/cn"

type PostVisibilityBadgeProps = {
	visibility: PostVisibilityEnumType
}

export default function PostVisibilityBadge({
	visibility,
}: PostVisibilityBadgeProps) {
	// Get label based on the visibility of the post
	const visibilityMap: { [key in PostVisibility]: string } = {
		[PostVisibility.PUBLIC]: "Public",
		[PostVisibility.FOLLOWERS_ONLY]: "Followers only",
		[PostVisibility.MENTIONED_ONLY]: "Mentioned only",
		[PostVisibility.FANS_ONLY]: "Fans only",
		[PostVisibility.ME_ONLY]: "Talking to myself",
	}

	// Get style based on the visibility of the post
	const styleMap: { [key in PostVisibility]: string } = {
		[PostVisibility.PUBLIC]: "bg-green-300 text-green-700",
		[PostVisibility.FOLLOWERS_ONLY]: "bg-blue-100 text-blue-800",
		[PostVisibility.MENTIONED_ONLY]: "bg-yellow-100 text-yellow-800",
		[PostVisibility.FANS_ONLY]: "bg-pink-100 text-pink-800",
		[PostVisibility.ME_ONLY]: "bg-gray-100 text-gray-800",
	}

	return (
		<>
			<Badge className={cn("w-fit", styleMap[visibility])} variant="default">
				{visibilityMap[visibility]}
			</Badge>
		</>
	)
}
