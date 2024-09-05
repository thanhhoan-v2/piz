import Post from "@components/molecules/post"
import { getPost } from "@prisma/functions/post"

export default async function PostPage({ params }: { params: { id: string } }) {
	const postId = Number.parseInt(params.id)
	const post = await getPost(postId)

	return (
		<>
			{post && (
				<Post
					id={postId}
					userId={post.userId}
					userName={post.userName}
					userAvatarUrl={post.userAvatarUrl}
					content={post.content}
					visibility={post.visibility}
					createdAt={post.createdAt}
					updatedAt={post.updatedAt}
					isDeleted={post.isDeleted}
					isPostPage
				/>
			)}
		</>
	)
}
