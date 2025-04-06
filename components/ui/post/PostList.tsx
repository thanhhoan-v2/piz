"use client"

import Post from "@components/ui/post"
import { useQueryAllPosts } from "@queries/client/post"

export default function PostList() {
	const {
		data: posts,
		isError,
		isSuccess,
		error,
		isLoading,
		isPending,
		isFetching,
	} = useQueryAllPosts()

	if (isError) {
		console.log("Error loading posts : ", error)
		return <div>Error loading posts 😢</div>
	}

	// if (isLoading || isFetching) return <div>Loading posts...</div>

	if (isSuccess)
		return (
			<>
				<div>
					{posts?.map(
						(
							{
								id,
								userId,
								userName,
								userAvatarUrl,
								content,
								createdAt,
								updatedAt,
								isDeleted,
								postImageUrl,
								postVideoUrl,
								snippetId,
							},
							index,
						) => (
							<Post
								postIndex={index}
								postsLength={posts.length}
								key={id}
								id={id}
								userId={userId}
								userName={userName}
								userAvatarUrl={userAvatarUrl}
								content={content}
								createdAt={createdAt}
								updatedAt={updatedAt}
								isDeleted={isDeleted}
								postImageUrl={postImageUrl}
								postVideoUrl={postVideoUrl}
								snippetId={snippetId}
							/>
						),
					)}
				</div>
			</>
		)
}
