"use client"

import { Button } from "@components/ui/Button"
import { Spinner } from "@components/ui/Spinner"
import Post from "@components/ui/post"
import PostForm from "@components/ui/post-form/PostForm"
import { useQueryTeamPosts } from "@queries/client/post"
import { useUser } from "@stackframe/stack"
import { ChevronDown, PenLine } from "lucide-react"
import { useEffect, useState } from "react"

export function TeamPosts({ teamId }: { teamId: string }) {
	const user = useUser()
	const [limit] = useState(5)
	const [cursor, setCursor] = useState<string | undefined>(undefined)

	const {
		data: postsData,
		isLoading,
		isFetching,
		refetch,
		// We don't use these, but they're available if needed
		// fetchNextPage,
		// hasNextPage,
	} = useQueryTeamPosts({
		teamId,
		limit,
		cursor,
		enabled: !!teamId,
	})

	// Reset cursor when teamId changes
	// We need to reset the cursor when the teamId changes to fetch posts for the new team
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		setCursor(undefined)
	}, [teamId])

	// Function to load more posts
	const loadMorePosts = () => {
		if (postsData?.nextCursor) {
			setCursor(postsData.nextCursor)
		}
	}

	if (isLoading) {
		return (
			<div className="flex justify-center py-8">
				<Spinner />
			</div>
		)
	}

	const posts = postsData?.posts || []

	return (
		<div className="bg-white shadow mb-6 p-6 rounded-lg">
			<h2 className="mb-4 font-semibold text-xl">Team Posts</h2>

			{/* Post Form */}
			<div className="mb-6">
				<PostForm
					teamId={teamId}
					onSuccess={() => {
						// Refresh the posts list after a new post is created
						console.log("Refreshing team posts after new post creation")
						refetch()
					}}
				>
					<Button
						variant="outline"
						className="flex items-center gap-2 px-4 py-2 border rounded-lg w-full text-left"
					>
						<div className="flex justify-center items-center bg-gray-200 rounded-full w-8 h-8">
							{user?.profileImageUrl ? (
								<img
									src={user.profileImageUrl}
									alt={user.displayName || "User"}
									className="rounded-full w-8 h-8"
								/>
							) : (
								<span>{user?.displayName?.[0] || "U"}</span>
							)}
						</div>
						<span className="flex items-center gap-2 text-gray-500">
							<PenLine size={16} />
							Write something to the team...
						</span>
					</Button>
				</PostForm>
			</div>

			{/* Posts List */}
			{posts.length === 0 ? (
				<div className="py-8 text-gray-500 text-center">
					No posts yet. Be the first to post in this team!
				</div>
			) : (
				<div className="space-y-6">
					{posts.map((post) => (
						<Post
							key={post.id}
							id={post.id}
							userId={post.userId}
							userName={post.userName}
							userAvatarUrl={post.userAvatarUrl}
							content={post.content}
							createdAt={post.createdAt}
							updatedAt={post.updatedAt}
							isDeleted={post.isDeleted || false}
							postImageUrl={post.postImageUrl}
							postVideoUrl={post.postVideoUrl}
							snippetId={post.snippetId}
							teamId={post.teamId}
						/>
					))}

					{/* Load More Button */}
					{postsData?.hasMore && (
						<div className="flex justify-center mt-4">
							<Button
								variant="outline"
								onClick={loadMorePosts}
								disabled={isFetching}
								className="flex items-center gap-2"
							>
								{isFetching ? (
									"Loading..."
								) : (
									<>
										Load More <ChevronDown size={16} />
									</>
								)}
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
