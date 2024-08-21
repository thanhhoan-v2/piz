import PostFormDesktop from "@components/molecules/post/post-form-desktop"
import Posts from "@components/molecules/post/post-list"
import { getAllPosts } from "@prisma/functions/post"
import {
	HydrationBoundary,
	QueryClient,
	dehydrate,
} from "@tanstack/react-query"

export default async function HomePage() {
	// Prefetch the posts
	const queryClient = new QueryClient()
	await queryClient.prefetchQuery({
		queryKey: ["posts"],
		queryFn: getAllPosts,
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
