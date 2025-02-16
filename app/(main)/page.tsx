import PostFormDesktop from "@components/ui/post-form/PostFormDesktop"
import PostList from "@components/ui/post/PostList"
import type { Post as IPost } from "@prisma/client"
import { getQueryClient } from "@queries/getQueryClient"
import { getAllPosts } from "@queries/server/post"
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
}

async function prefetchUser() {
	await queryClient.prefetchQuery({
		queryKey: queryKey.user.selectMain(),
	})

	const appUser = queryClient.getQueryData(queryKey.user.selectMain())
	if (appUser) {
		await queryClient.prefetchQuery({
			queryKey: queryKey.noti.all,
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
