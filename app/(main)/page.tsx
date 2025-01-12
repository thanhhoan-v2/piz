import PostFormDesktop from "@components/ui/post/PostFormDesktop"
import PostList from "@components/ui/post/PostList"
import type { Post as IPost } from "@prisma/client"
import { getQueryClient } from "@queries/getQueryClient"
import { getAllPosts } from "@queries/server/post"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { queryKey } from "@utils/queryKeyFactory"

// Must be created outside of the component,
// to avoid recreating the instance on each render

const queryClient = getQueryClient()
/**
 * Prefetches all posts data and optionally prefetches related data for each post.
 *
 * This function initiates a prefetch query to retrieve all posts using the query client.
 * It stores the fetched posts data in the query cache using a specific query key.
 * 
 * The commented-out section within the function suggests additional prefetch operations
 * that can be performed for each post, such as fetching user reactions, post counts,
 * and comments associated with each post.
 * 
 * Currently, these additional prefetch operations are disabled, but they can be enabled
 * to optimize data retrieval for posts and their related entities.
 */

async function prefetchPosts() {
	await queryClient.prefetchQuery({
		queryKey: queryKey.post.all,
		queryFn: async () => getAllPosts(),
	})

	const allPosts = queryClient.getQueryData<IPost[]>(queryKey.post.all)
	// if (allPosts && Array.isArray(allPosts)) {
	// 	await Promise.all(
	// 		allPosts.map(async (post) => {
	// 			await queryClient.prefetchQuery({
	// 				queryKey: [
	// 					queryKey.post.selectReactionByUser({
	// 						userId: post.userId,
	// 						// postId: post.id,
	// 					}),
	// 				],
	// 				queryFn: async () =>
	// 					getPostReaction({ userId: post.userId, postId: post.id }),
	// 			})
	// 			await queryClient.prefetchQuery({
	// 				queryKey: queryKey.post.selectCount(post.id),
	// 				queryFn: async () => getPostCounts({ postId: post.id }),
	// 			})
	// 			await queryClient.prefetchQuery({
	// 				queryKey: queryKey.comment.selectPost(post.id),
	// 				queryFn: async () => getAllCommentsByPost({ postId: post.id }),
	// 			})
	// 		}),
	// 	)
	// }
}

async function prefetchUser() {
	await queryClient.prefetchQuery({
		queryKey: queryKey.user.selectMain(),
		// queryFn: async () => useSupabaseUser,
	})

	const appUser = queryClient.getQueryData(queryKey.user.selectMain())
	if (appUser) {
		await queryClient.prefetchQuery({
			queryKey: queryKey.noti.all,
			// queryFn: async () => getAllNotifications({ receiverId: appUser.id }),
		})
	}
}

/**
 * The home page of the app.
 *
 * The home page displays all the posts of the app.
 *
 * Prefetches the posts and the user data.
 *
 * The posts are fetched in the background and then displayed by the
 * `PostList` component.
 *
 * The user data is fetched in the background and then stored in the
 * `queryClient` cache.
 *
 * @returns The home page component.
 */
export default async function HomePage() {
	await Promise.all([prefetchPosts(), prefetchUser()])

	return (
		<>
			<div className="mt-[100px] flex-col gap-2">
				<PostFormDesktop />
				<HydrationBoundary state={dehydrate(queryClient)}>
					<PostList />
				</HydrationBoundary>
			</div>
		</>
	)
}
