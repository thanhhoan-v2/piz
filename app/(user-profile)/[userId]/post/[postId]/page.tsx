"use client"
import { Separator } from "@components/ui/Separator"
import PostComment from "@components/ui/comment"
import Post from "@components/ui/post"
import { useQueryAllComments } from "@queries/client/comment"
import { useQueryPost } from "@queries/client/post"
import { buildCommentTree } from "@utils/comment-tree.helpers"
import { RefreshCw } from "lucide-react"
import React from "react"

export default function PostPage({ params }: { params: Promise<{ postId: string }> }) {
	const [postId, setPostId] = React.useState("")

	React.useEffect(() => {
		const getPostId = async () => {
			const { postId } = await params
			setPostId(postId)
		}
		getPostId()
	}, [params])

	const { data: post } = useQueryPost({
		postId,
		enabled: !!postId,
	})

	const { data: unstructuredComments, refetch: refetchComments } = useQueryAllComments({
		postId,
		enabled: !!postId,
	})

	const comments = unstructuredComments ? buildCommentTree(unstructuredComments) : null

	const handleRefetchComments = () => {
		refetchComments()
	}

	return post ? (
		<div className="mt-[100px] flex-col">
			<Post {...post} />

			<div className="my-4 flex-center gap-3">
				<Separator className="w-1/3" />
				<RefreshCw
					onClick={handleRefetchComments}
					size={15}
					className="cursor-pointer text-[#272727] hover:text-white"
				/>
				<Separator className="w-1/3" />
			</div>

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
	)
}
