"use client"

import Post from "@components/molecules/post"
import { POST } from "@constants/query-key"
import type { Post as IPost } from "@prisma/client"
import { getAllPosts } from "@prisma/functions/post"
import { useQuery } from "@tanstack/react-query"

export default function PostList() {
	const {
		data: posts,
		isLoading,
		isError,
		isSuccess,
		isPending,
		isFetching,
		error,
	} = useQuery<IPost[]>({
		queryKey: [POST.ALL],
		queryFn: async () => getAllPosts(),
		retry: 3,
	})

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
