"use client"

import {
	getAllChildComments,
	getAllCommentsByPost,
	getComment,
	getCommentCounts,
	getCommentReaction,
} from "@queries/server/comment"
import { useQuery } from "@tanstack/react-query"
import { queryKey } from "@utils/queryKeyFactory"

export const useQueryComment = ({ commentId }: { commentId: string }) =>
	useQuery({
		queryKey: queryKey.comment.selectId(commentId),
		queryFn: async () => getComment(commentId),
		enabled: !!commentId,
	})

export const useQueryChildComments = ({ parentId }: { parentId: string }) =>
	useQuery({
		queryKey: queryKey.comment.selectIdChild(parentId),
		queryFn: async () => getAllChildComments(parentId),
		enabled: !!parentId,
	})

export const useQueryCommentCounts = ({
	commentId,
	parentId,
}: { commentId: string; parentId: string | null }) =>
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

interface UseQueryAllCommentsParams {
	postId: string;
	enabled?: boolean;
}

export const useQueryAllComments = ({ postId, enabled = true }: UseQueryAllCommentsParams) =>
	useQuery({
		queryKey: queryKey.comment.selectPost(postId),
		queryFn: async () => getAllCommentsByPost({ postId }),
		enabled: !!postId && enabled,
		staleTime: 0,
		refetchOnMount: true
	})
