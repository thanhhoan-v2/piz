import PostFormDesktop from "@components/ui/post/PostFormDesktop"
import PostList from "@components/ui/post/PostList"
import type { AppUser } from "@prisma/client"
import type { Post as IPost } from "@prisma/client"
import { getQueryClient } from "@queries/getQueryClient"
import { getAllCommentsByPost } from "@queries/server/comment"
import { getAllNotifications } from "@queries/server/noti"
import { getAllPosts, getPostCounts } from "@queries/server/post"
import { getPostReaction } from "@queries/server/postReaction"
import { useSupabaseUser } from "@queries/server/supabase/supabaseUser"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { queryKey } from "@utils/queryKeyFactory"

// Must be created outside of the component,
// to avoid recreating the instance on each render

const queryClient = getQueryClient()
async function prefetchPosts() {
	await queryClient.prefetchQuery({
		queryKey: queryKey.post.all,
		queryFn: async () => getAllPosts(),
	})

	const allPosts = queryClient.getQueryData<IPost[]>(queryKey.post.all)
	if (allPosts && Array.isArray(allPosts)) {
		await Promise.all(
			allPosts.map(async (post) => {
				await queryClient.prefetchQuery({
					queryKey: [
						queryKey.post.selectReactionByUser({
							userId: post.userId,
							postId: post.id,
						}),
					],
					queryFn: async () =>
						getPostReaction({ userId: post.userId, postId: post.id }),
				})
				await queryClient.prefetchQuery({
					queryKey: queryKey.post.selectCount(post.id),
					queryFn: async () => getPostCounts({ postId: post.id }),
				})
				await queryClient.prefetchQuery({
					queryKey: queryKey.comment.selectPost(post.id),
					queryFn: async () => getAllCommentsByPost({ postId: post.id }),
				})
			}),
		)
	}
}

async function prefetchUser() {
	await queryClient.prefetchQuery({
		queryKey: queryKey.user.selectMain(),
		queryFn: async () => useSupabaseUser,
	})

	const appUser = queryClient.getQueryData<AppUser>(queryKey.user.selectMain())
	if (appUser) {
		await queryClient.prefetchQuery({
			queryKey: queryKey.noti.selectId(appUser.id),
			queryFn: async () => getAllNotifications({ receiverId: appUser.id }),
		})
	}
}

export default async function HomePage() {
	await Promise.all([prefetchPosts(), prefetchUser()])

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
