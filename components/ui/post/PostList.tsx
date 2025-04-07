"use client"

import Post from "@components/ui/post"
import { Button } from "@components/ui/Button"
import { PaginatedPosts, useQueryAllPosts } from "@queries/client/post"
import { useEffect, useState } from "react"
import type { Post as PostType } from "@prisma/client"
import { Loader2 } from "lucide-react"

export default function PostList() {
	// State for accumulated posts and pagination
	const [allPosts, setAllPosts] = useState<PostType[]>([])
	const [cursor, setCursor] = useState<string | undefined>(undefined)
	const [hasMore, setHasMore] = useState<boolean>(true)
	const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)
	
	// Fetch posts with current cursor
	const {
		data,
		isError,
		isSuccess,
		error,
		isLoading,
		isFetching,
	} = useQueryAllPosts({
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
				setAllPosts(prev => [...prev, ...data.posts])
			}
			
			// Update hasMore flag
			setHasMore(data.hasMore)
		}
	}, [data, cursor])

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
							},
							index,
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
							/>
						),
					)}
				</div>
				{/* Show Load More button only if there are more posts to load */}
				{hasMore ? (
					<div className="mt-6 mb-4 flex justify-center">
						<Button
							variant="outline"
							className="px-8 py-2 rounded-full border-border/50 bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-all"
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
						<p className="text-muted-foreground font-medium text-lg">No more posts to show</p>
						<p className="text-muted-foreground/70 text-sm mt-1">You've reached the end of your feed</p>
					</div>
				)}
			</>
		)
}
