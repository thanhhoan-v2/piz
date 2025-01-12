import type { Post } from "@prisma/client"
import {
	getAllPosts,
	getAllUserPosts,
	getPost,
	getPostCounts,
} from "@queries/server/post"
import { getPostReaction } from "@queries/server/postReaction"
import { useQuery } from "@tanstack/react-query"
import { queryKey } from "@utils/queryKeyFactory"

export const useQueryPostCounts = ({ postId }: { postId: string }) =>
	useQuery({
		queryKey: queryKey.post.selectCount(postId),
		queryFn: async () => getPostCounts({ postId }),
		enabled: !!postId,
	})

export const useQueryPostReaction = ({
	userId,
	postId,
}: { userId?: string; postId: string }) =>
	useQuery({
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		queryKey: queryKey.post.selectReactionByUser({ userId: userId!, postId }),
		queryFn: async () => getPostReaction({ userId, postId }),
		enabled: !!userId && !!postId,
	})

interface UseQueryPostParams {
	postId: string;
	enabled?: boolean;
}

export const useQueryPost = ({ postId, enabled = true }: UseQueryPostParams) =>
	useQuery({
		queryKey: queryKey.post.selectId(postId),
		queryFn: async () => getPost(postId),
		enabled: !!postId && enabled
	})

interface UseQueryAllUserPostsParams {
	userId: string;
	enabled?: boolean;
}

export const useQueryAllUserPosts = ({ userId, enabled }: UseQueryAllUserPostsParams) =>
	useQuery({
		queryKey: queryKey.post.selectUser(userId),
		queryFn: async () => getAllUserPosts(userId),
		// staleTime: Number.POSITIVE_INFINITY,
	})

export const useQueryAllPosts = () =>
	useQuery<Post[]>({
		queryKey: queryKey.post.all,
		queryFn: async () => getAllPosts(),
		staleTime: Number.POSITIVE_INFINITY,
	})
