"use client"

import Post from "@components/ui/post"
import { useQueryAllPosts } from "@queries/client/post"

export default function PostList() {
	// const {
	// 	data: posts,
	// 	isLoading,
	// 	isError,
	// 	isSuccess,
	// 	isPending,
	// 	isFetching,
	// 	error,
	// } = useQuery<IPost[]>({
	// 	queryKey: [POST.ALL],
	// 	queryFn: async () => getAllPosts(),
	// 	retry: 3,
	// })

	const {
		data: posts,
		isLoading,
		isError,
		isSuccess,
		isPending,
		isFetching,
		error,
	} = useQueryAllPosts()

	if (isError) {
		console.log("Error loading posts : ", error)
		return <div>Error loading posts 😢</div>
	}
	if (isLoading || isFetching) return <div>Loading posts...</div>
	if (isSuccess)
		return (
			<>
				{isPending && <div>Creating new post...</div>}
				<div>
					{posts?.map(
						({
							id,
							userId,
							userName,
							userAvatarUrl,
							content,
							visibility,
							createdAt,
							updatedAt,
							isDeleted,
						}) => (
							<Post
								key={id}
								id={id}
								userId={userId}
								userName={userName}
								userAvatarUrl={userAvatarUrl}
								content={content}
								visibility={visibility}
								createdAt={createdAt}
								updatedAt={updatedAt}
								isDeleted={isDeleted}
							/>
						),
					)}
				</div>
			</>
		)
}
