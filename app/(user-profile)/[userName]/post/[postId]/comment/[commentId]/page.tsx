"use client"

import { Separator } from "@components/ui/Separator"
import PostComment, { type CommentWithChildren } from "@components/ui/comment"
import Post from "@components/ui/post"
import { useQueryAllComments, useQueryComment } from "@queries/client/comment"
import { useQueryPost } from "@queries/client/post"
import {
	buildCommentTree,
	extractFromCommentTreeById,
} from "@utils/comment-tree.helpers"
import Link from "next/link"
import { useParams } from "next/navigation"

/**
 * Page displaying a single comment and all its children.
 *
 * @returns JSX element for the comment page.
 */
export default function CommentPage() {
	const params = useParams<{
		userName: string
		postId: string
		commentId: string
	}>()
	const userName = params.userName
	const postId = params.postId
	const commentId = params.commentId

	const { data: post } = useQueryPost({ postId })
	const { data: comment } = useQueryComment({ commentId })
	const {
		data: unstructuredAllComments,
		isSuccess: isQueryAllCommentsSuccess,
	} = useQueryAllComments({ postId })

	const allCommentsFromPost = unstructuredAllComments
		? buildCommentTree(unstructuredAllComments)
		: null

	let comments: CommentWithChildren[] = []
	if (allCommentsFromPost) {
		comments = extractFromCommentTreeById(allCommentsFromPost, commentId)
	}

	return (
		<>
			<div className="flex-col mt-[100px]">
				{post ? <Post {...post} /> : <>Could not load post</>}

				{/* <div className="flex-center"> */}
				{/* 	<Separator */}
				{/* 		className="my-[-20px] h-[50px] w-[20px] rounded-lg bg-background-item" */}
				{/* 		orientation="vertical" */}
				{/* 	/> */}
				{/* </div> */}

				{/* {comment && <PostComment {...comment} />} */}

				<div className="mt-2 mb-4 w-full flex-center gap-4">
					<Separator className="w-1/3" />
					<Link
						className="text-center decoration-pink-400 underline-offset-4 hover:underline hover:decoration-wavy"
						href={`/${userName}/post/${postId}`}
					>
						See full discussion
					</Link>
					<Separator className="w-1/3" />
				</div>

				{isQueryAllCommentsSuccess && comments ? (
					<div className="flex-col">
						{comments?.map((childComment) => (
							<PostComment
								key={childComment.id}
								{...childComment}
								childrenComment={{
									...childComment,
									children: childComment.children ?? [],
								}}
							/>
						))}
					</div>
				) : (
					<></>
				)}
			</div>
		</>
	)
}
