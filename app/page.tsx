import PostFormDesktop from "@components/molecules/post/post-form-desktop"
import PostList from "@components/molecules/post/post-list"
import { POST, USER } from "@constants/query-key"
import { getPostComments } from "@hooks/queries/comment"
import { getAllPosts, getPostCounts } from "@prisma/functions/post"
import { getPostReaction } from "@prisma/functions/post/reaction"
import type { PrismaPost } from "@prisma/global"
import { getAppUser } from "@supabase/functions/fetchUser"
import {
	HydrationBoundary,
	QueryClient,
	dehydrate,
} from "@tanstack/react-query"

export default async function HomePage() {
	const queryClient = new QueryClient()

	// Prefetch the posts
	// TODO:
	// - Implement user custom feed for authorized userr & public feed for non-authorized users
	// - Change to prefetchInfiniteQuery
	await queryClient.prefetchQuery({
		queryKey: [POST.ALL],
		queryFn: getAllPosts,
	})

	const allPosts = queryClient.getQueryData<PrismaPost[]>([POST.ALL])
	if (allPosts && Array.isArray(allPosts)) {
		for (const post of allPosts) {
			// Prefetch reactions for each post
			await queryClient.prefetchQuery({
				queryKey: [POST.REACTION, post.userId, post.id],
				queryFn: () =>
					getPostReaction({ userId: post.userId, postId: post.id }),
			})
			// Prefetch counts (reaction, comment, share) for each post
			await queryClient.prefetchQuery({
				queryKey: [POST.COUNTS, post.id],
				queryFn: () => getPostCounts({ postId: post.id }),
			})
			// Prefetch comment(s)
			await queryClient.prefetchQuery({
				queryKey: [POST.COMMENT, post.id],
				queryFn: () => getPostComments({ postId: post.id }),
			})
		}
	}

	// Prefetch the authorized user
	await queryClient.prefetchQuery({
		queryKey: [USER.APP],
		queryFn: getAppUser,
	})

	return (
		<>
			<div className="flex-col gap-2">
				<PostFormDesktop />
				<HydrationBoundary state={dehydrate(queryClient)}>
					<PostList />
				</HydrationBoundary>
			</div>
		</>
	)
}
