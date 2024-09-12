"use client"

import PostComment from "@components/ui/comment"
import Post from "@components/ui/post"
import { useQueryAllComments } from "@queries/client/comment"
import { useQueryPost } from "@queries/client/post"
import { buildCommentTree } from "@utils/comment-tree.helpers"

export default function PostPage({ params }: { params: { postId: string } }) {
	const postId = params.postId
	const { data: post } = useQueryPost({ postId })
	const { data: unstructuredComments } = useQueryAllComments({ postId })

	const comments = unstructuredComments
		? buildCommentTree(unstructuredComments)
		: null

	// const queryClient = useQueryClient()
	// React.useEffect(() => {
	// 	queryClient.setQueryData(queryKey.comment.all, comments)
	// }, [comments])

	return (
		<>
			{post ? (
				<div className="flex-col">
					<Post {...post} />

					{comments && comments.length > 0 ? (
						<>
							{comments.map((comment) => (
								<PostComment
									childrenComment={{
										...comment,
										children: comment.children ?? [],
									}}
									key={comment.id}
									{...comment}
								/>
							))}
						</>
					) : (
						<>No comments</>
					)}
				</div>
			) : (
				<>Failed to load post 😢</>
			)}
		</>
	)
}
