import type { Post } from "@prisma/client"
import {
	deletePost,
	getAllPosts,
	getAllUserPosts,
	getPost,
	getPostCounts,
	getTeamPosts,
} from "@queries/server/post"
import { getPostReaction } from "@queries/server/postReaction"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKey } from "@utils/queryKeyFactory"
import { toast } from "sonner"

export const useQueryPostCounts = ({ postId }: { postId: string }) =>
	useQuery({
		queryKey: queryKey.post.selectCount(postId),
		queryFn: async () => getPostCounts({ postId }),
		enabled: !!postId,
	})

export const useQueryPostReaction = ({ userId, postId }: { userId?: string; postId: string }) =>
	useQuery({
		queryKey: queryKey.post.selectReactionByUser({ userId: userId!, postId }),
		queryFn: async () => getPostReaction({ userId, postId }),
		enabled: !!userId && !!postId,
	})

interface UseQueryPostParams {
	postId: string
	enabled?: boolean
}

export const useQueryPost = ({ postId, enabled = true }: UseQueryPostParams) =>
	useQuery({
		queryKey: queryKey.post.selectId(postId),
		queryFn: async () => getPost(postId),
		enabled: !!postId && enabled,
	})

interface UseQueryAllUserPostsParams {
	userId: string
	enabled?: boolean
}

export const useQueryAllUserPosts = ({ userId, enabled }: UseQueryAllUserPostsParams) =>
	useQuery({
		queryKey: queryKey.post.selectUser(userId),
		queryFn: async () => getAllUserPosts(userId),
		// staleTime: Number.POSITIVE_INFINITY,
	})

// Define return type for the paginated posts query
export interface PaginatedPosts {
	posts: Post[]
	nextCursor?: string
	hasMore: boolean
}

export interface UseQueryAllPostsParams {
	limit?: number
	cursor?: string
	enabled?: boolean
}

export const useQueryAllPosts = ({
	limit = 5, // Default to 5 posts per page
	cursor,
	enabled = true,
}: UseQueryAllPostsParams = {}) => {
	return useQuery<PaginatedPosts>({
		queryKey: [...queryKey.post.all, { limit, cursor }],
		queryFn: async () => getAllPosts(limit, cursor),
		staleTime: 5000, // Reduce stale time to 5 seconds for faster updates
		refetchInterval: 10000, // Check for new posts more frequently (every 10 seconds)
		refetchOnMount: true, // Always refetch when component mounts
		refetchOnWindowFocus: true, // Refetch when window regains focus
		enabled,
	})
}

// Hook to fetch team-specific posts
export const useQueryTeamPosts = ({
	teamId,
	limit = 5,
	cursor,
	enabled = true,
}: {
	teamId: string
	limit?: number
	cursor?: string
	enabled?: boolean
}) => {
	return useQuery<PaginatedPosts>({
		queryKey: [...queryKey.post.byTeam(teamId), { limit, cursor }],
		queryFn: async () => getTeamPosts(teamId, limit, cursor),
		staleTime: 5000, // Reduce stale time to 5 seconds for faster updates
		refetchInterval: 10000, // Check for new posts more frequently (every 10 seconds)
		refetchOnMount: true, // Always refetch when component mounts
		refetchOnWindowFocus: true, // Refetch when window regains focus
		enabled: !!teamId && enabled,
	})
}

interface DeletePostParams {
	postId: string
	userId: string
}

export const useDeletePostMutation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ postId, userId }: DeletePostParams) => {
			return deletePost(postId, userId)
		},
		onMutate: async ({ postId }) => {
			// Cancel any outgoing refetches to prevent overwriting optimistic update
			await queryClient.cancelQueries({ queryKey: queryKey.post.all })
			await queryClient.cancelQueries({ queryKey: queryKey.post.selectId(postId) })

			// Snapshot the previous values
			const previousPosts = queryClient.getQueryData(queryKey.post.all)

			// Optimistically remove the post from the cache
			queryClient.setQueryData(queryKey.post.all, (old: any) => {
				if (!old) return []
				// Handle the case where the data is an object with posts property (paginated)
				if (old.posts && Array.isArray(old.posts)) {
					return {
						...old,
						posts: old.posts.filter((post: any) => post.id !== postId),
					}
				}
				// Handle the case where the data is directly an array of posts
				if (Array.isArray(old)) {
					return old.filter((post) => post.id !== postId)
				}
				// Return unchanged if structure is unexpected
				return old
			})

			// Return the snapshots so we can rollback if something goes wrong
			return { previousPosts }
		},
		onSuccess: (result) => {
			if (result.success) {
				toast.success("Post deleted successfully")
				// Invalidate all related queries to refetch the latest data
				queryClient.invalidateQueries({ queryKey: queryKey.post.all })
			} else {
				toast.error(result.message || "Failed to delete post")
			}
		},
		onError: (error, variables, context) => {
			toast.error("Failed to delete post")
			console.error("Error deleting post:", error)

			// Rollback to the previous state
			if (context?.previousPosts) {
				queryClient.setQueryData(queryKey.post.all, context.previousPosts)
			}
		},
	})
}
