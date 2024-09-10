"use client"

import PostComment, { type CommentWithChildren } from "@components/ui/comment"
import Post from "@components/ui/post"
import type { Comment as IComment } from "@prisma/client"
import { useQueryAllComments } from "@queries/client/comment"
import { useQueryPost } from "@queries/client/post"

export default function PostPage({ params }: { params: { id: string } }) {
	const postId = params.id
	const { data: post } = useQueryPost({ postId })
	const { data: unstructuredComments } = useQueryAllComments({ postId })

	const comments = unstructuredComments
		? buildCommentTree(unstructuredComments)
		: null

	return (
		<>
			{post ? (
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

const buildCommentTree = (comments: IComment[]) => {
	const commentMap: { [key: string]: CommentWithChildren } = {}
	const roots: CommentWithChildren[] = []

	// Initialize all comments in a map (for quick access)
	for (const comment of comments) {
		commentMap[comment.id] = { ...comment, children: [] }
	}

	for (const comment of comments) {
		if (comment.id === comment.parentId) {
			// Initialize roots
			roots.push(commentMap[comment.id])
		} else {
			// and link children to their respective parents
			commentMap[comment.parentId].children.push(commentMap[comment.id])
		}
	}

	// Append children to their respective parents recursively
	// Traverses the tree & ensures that all nested comments are correctly added to their parents
	function addChildren(parent: CommentWithChildren) {
		for (const child of parent.children) {
			if (commentMap[child.id].children.length > 0) {
				addChildren(commentMap[child.id])
			}
		}
	}

	for (const root of roots) {
		addChildren(root)
	}

	return roots
}
