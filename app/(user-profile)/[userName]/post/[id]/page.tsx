import PostComment from "@components/molecules/comment"
import Post from "@components/molecules/post"
import { getPostComments } from "@prisma/functions/comment"
import { getPost } from "@prisma/functions/post"

export default async function PostPage({ params }: { params: { id: string } }) {
	const postId = Number.parseInt(params.id)
	const post = await getPost(postId)

	const comments = await getPostComments({ postId })
	console.log(comments)

	return (
		<>
			{post && (
				<div className="flex-col">
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

					{comments && comments.length > 0 && (
						<>
							{comments.map((comment) => (
								<PostComment
									key={comment.id}
									id={comment.id}
									userId={comment.userId}
									postId={comment.postId}
									parentId={comment.parentId}
									degree={comment.degree}
									content={comment.content}
									createdAt={comment.createdAt}
									updatedAt={comment.updatedAt}
									isDeleted={comment.isDeleted}
									userName={comment.userName}
									userAvatarUrl={comment.userAvatarUrl}
								/>
							))}
						</>
					)}
				</div>
			)}
		</>
	)
}
