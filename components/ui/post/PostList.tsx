"use client"

import { usePostCreation } from "@/context/PostCreationContext"
import { Button } from "@components/ui/Button"
import Post from "@components/ui/post"
import { PostCreationBanner } from "@components/ui/post/PostCreationBanner"
import type { Post as PostType } from "@prisma/client"
import { useQueryAllPosts } from "@queries/client/post"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

export default function PostList() {
	// State for accumulated posts and pagination
	const [allPosts, setAllPosts] = useState<PostType[]>([])
	const [cursor, setCursor] = useState<string | undefined>(undefined)
	const [hasMore, setHasMore] = useState<boolean>(true)
	const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)

	// Get post creation context to check for and remove creating posts
	const { creatingPosts, removeCreatingPost } = usePostCreation()

	// Fetch posts with current cursor
	const { data, isError, isSuccess, error, isLoading, isFetching } = useQueryAllPosts({
		limit: 5, // Limit to 5 posts per fetch to reduce network requests
		cursor: cursor,
	})

	// Update accumulated posts when data changes
	useEffect(() => {
		if (data?.posts) {
			if (cursor === undefined) {
				// Initial load - replace all posts
				setAllPosts(data.posts)
			} else {
				// Subsequent loads - append posts
				setAllPosts((prev) => [...prev, ...data.posts])
			}

			// Update hasMore flag
			setHasMore(data.hasMore)

			// Check if any of the newly loaded posts were being created
			// If so, remove them from the creating posts list
			data.posts.forEach((post) => {
				if (creatingPosts.includes(post.id)) {
					// Post has appeared in the list, so we can remove it from creating posts
					removeCreatingPost(post.id)
				}
			})
		}
	}, [data, cursor, creatingPosts, removeCreatingPost])

	// Handle loading more posts
	const loadMorePosts = () => {
		if (data?.nextCursor) {
			setIsLoadingMore(true)
			setCursor(data.nextCursor)
		}
	}

	// Reset loading state when new data arrives
	useEffect(() => {
		if (isLoadingMore && data) {
			setIsLoadingMore(false)
		}
	}, [data, isLoadingMore])

	if (isError) {
		console.log("Error loading posts: ", error)
		return <div>Error loading posts 😢</div>
	}

	// if (isLoading || isFetching) return <div>Loading posts...</div>

	if (isSuccess)
		return (
			<>
				{/* Post Creation Banner - will show when posts are being created */}
				<PostCreationBanner />

				<div>
					{allPosts.map(
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
								teamId,
							},
							index
						) => (
							<Post
								postIndex={index}
								postsLength={allPosts.length}
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
								teamId={teamId}
							/>
						)
					)}
				</div>
				{/* Show Load More button only if there are more posts to load */}
				{hasMore ? (
					<div className="flex justify-center mt-6 mb-4">
						<Button
							variant="outline"
							className="bg-background/80 hover:bg-background/90 backdrop-blur-sm px-8 py-2 border-border/50 rounded-full transition-all"
							onClick={loadMorePosts}
							disabled={isLoadingMore}
						>
							{isLoadingMore ? (
								<span className="flex items-center gap-2">
									<Loader2 size={16} className="animate-spin" />
									Loading...
								</span>
							) : (
								"Show More Posts"
							)}
						</Button>
					</div>
				) : (
					<div className="my-16 text-center">
						<p className="font-medium text-muted-foreground text-lg">No more posts to show</p>
						<p className="mt-1 text-muted-foreground/70 text-sm">
							You've reached the end of your feed
						</p>
					</div>
				)}
			</>
		)
}
