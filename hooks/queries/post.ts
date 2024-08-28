import { POST } from "@constants/query-key"
import { getPostCounts } from "@prisma/functions/post"
import { getPostReaction } from "@prisma/functions/post/reaction"
import { useQuery } from "@tanstack/react-query"

export const useQueryPostCounts = ({ postId }: { postId: number }) =>
	useQuery({
		queryKey: [POST.COUNTS, postId],
		queryFn: () => getPostCounts({ postId }),
		enabled: !!postId, // Only runs when postId is available
	})

export const useQueryPostReaction = ({
	userId,
	postId,
}: { userId?: string; postId: number }) =>
	useQuery({
		queryKey: [POST.REACTION, userId, postId],
		queryFn: () => getPostReaction({ userId, postId }),
		enabled: !!userId && !!postId, // Only runs when userId and postId is available
	})
