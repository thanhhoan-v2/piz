"use client"

import Post from "@components/molecules/post"
import { useQueryPosts } from "@hooks/queries/posts"

export default function Posts() {
	const { data: posts, isLoading, isError, isSuccess } = useQueryPosts()

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
