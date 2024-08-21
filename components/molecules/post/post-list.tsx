"use client"
import Post from "@components/molecules/post"
import { getAllPosts } from "@prisma/functions/post"
import type { PostProps } from "@prisma/global"
import { useQuery } from "@tanstack/react-query"

export default function Posts() {
	const {
		data: posts,
		isLoading,
		isError,
		isSuccess,
	} = useQuery<PostProps[]>({
		queryKey: ["posts"],
		queryFn: async () => getAllPosts(),
		refetchOnMount: "always", // Always refetch data when the component mounts
		// refetchInterval: 1000 * 60, // Continuously fetch data every 1 minute
	})

	if (isLoading) return <div>Loading posts...</div>
	if (isError) return <div>Error loading posts 😢</div>
	if (isSuccess)
		return (
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
		)
}
