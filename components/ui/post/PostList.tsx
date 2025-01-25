"use client"
import Post from "@components/ui/post"
import { useQueryAllPosts } from "@queries/client/post"

export default function PostList() {
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

	console.log(posts)

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
								title,
								content,
								createdAt,
								updatedAt,
								isDeleted,
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
								title={title}
								content={content}
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
