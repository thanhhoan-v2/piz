import {
	getAllCommentsByPost,
	getCommentCounts,
	getCommentReaction,
} from "@queries/server/comment"
import { useQuery } from "@tanstack/react-query"
import { queryKey } from "@utils/queryKeyFactory"

export const useQueryCommentCounts = ({
	commentId,
	parentId,
}: { commentId: string; parentId: string }) =>
	useQuery({
		queryKey: queryKey.comment.selectCountByComment({
			commentId: commentId,
			parentId: parentId,
		}),
		queryFn: async () => getCommentCounts({ commentId, parentId }),
		enabled: !!commentId && !!parentId,
	})

export const useQueryCommentReaction = ({
	userId,
	commentId,
}: { userId?: string; commentId: string }) =>
	useQuery({
		queryKey: queryKey.comment.selectReactionByUser({
			userId: userId,
			commentId: commentId,
		}),
		queryFn: async () => getCommentReaction({ userId, commentId }),
		enabled: !!userId && !!commentId,
	})

export const useQueryAllComments = ({ postId }: { postId: string }) =>
	useQuery({
		queryKey: queryKey.comment.all,
		queryFn: async () => getAllCommentsByPost({ postId }),
	})
