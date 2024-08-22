import PostFormDesktop from "@components/molecules/post/post-form-desktop"
import Posts from "@components/molecules/post/post-list"
import { POST, USER } from "@constants/query-key"
import { getAllPosts } from "@prisma/functions/post"
import { getAppUser } from "@supabase/functions/fetchUser"
import {
	HydrationBoundary,
	QueryClient,
	dehydrate,
} from "@tanstack/react-query"

export default async function HomePage() {
	const queryClient = new QueryClient()

	// Prefetch the posts
	await queryClient.prefetchQuery({
		queryKey: [POST.ALL],
		queryFn: getAllPosts,
	})

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
					<Posts />
				</HydrationBoundary>
			</div>
		</>
	)
}
