"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/Avatar"
import { Separator } from "@components/ui/Separator"
import { Skeleton } from "@components/ui/Skeleton"
import Post, { postWidths } from "@components/ui/post"
import type { Post as IPost } from "@prisma/client"
import { useQueryFollowersCount, useQueryFollowingCount } from "@queries/client/follow"
import { useQueryAllUserPosts } from "@queries/client/post"
import { cn } from "@utils/cn"
import { avatarPlaceholder } from "@utils/image.helpers"
import { firstLetterToUpper } from "@utils/string.helpers"
import { Sparkles } from "lucide-react"
import React from "react"
import FollowButton from "./FollowButton"
import FollowersDialog from "./FollowersDialog"
import FollowingDialog from "./FollowingDialog"

interface SerializedUser {
	id: string
	userName: string
	avatarUrl?: string | null
}

export default function UserProfile({ initialUser }: { initialUser: SerializedUser }) {
	const [posts, setPosts] = React.useState<IPost[]>([])
	const postsQuery = useQueryAllUserPosts({
		userId: initialUser?.id ?? "",
	})
	// Get followers and following counts
	const followersQuery = useQueryFollowersCount(initialUser?.id ?? "")
	const followingQuery = useQueryFollowingCount(initialUser?.id ?? "")
	const isLoading = postsQuery.isLoading

	React.useEffect(() => {
		if (postsQuery.data) {
			setPosts(postsQuery.data)
		}
	}, [postsQuery.data])

	return (
		<div className={cn("min-h-screen mt-[100px]", postWidths)}>
			{/* Hero Section */}
			<div className="relative overflow-hidden">
				<div className="absolute inset-0" />
				<div className="relative px-4 py-12 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-2xl">
						{/* Profile Header */}
						<div className="flex flex-col items-center space-y-6 text-center animate-fade-in">
							<Avatar className="h-32 w-32 ring-4 ring-background shadow-xl transition-all duration-300 hover:scale-105 hover:ring-primary/20 hover:shadow-2xl">
								<AvatarImage src={initialUser?.avatarUrl ?? avatarPlaceholder} />
								<AvatarFallback>Piz</AvatarFallback>
							</Avatar>
							<div className="space-y-2 transition-all duration-300 hover:scale-[1.02]">
								<h1 className="text-4xl font-bold tracking-tight">
									{initialUser ? firstLetterToUpper(initialUser.userName) : "Unknown User"}
								</h1>
								<p className="text-lg text-muted-foreground">
									@{initialUser?.userName ?? "unknown"}
								</p>
							</div>
							<FollowButton userId={initialUser.id} />
						</div>

						{/* Stats Section */}
						<div className="mt-10">
							<div className="flex justify-center gap-8 text-center">
								<div className="flex flex-col p-4 rounded-lg transition-colors hover:bg-primary/5 cursor-pointer">
									<span className="text-2xl font-bold">
										{isLoading ? <Skeleton className="h-8 w-8" /> : posts.length}
									</span>
									<span className="text-sm text-muted-foreground">Posts</span>
								</div>
								{/* Followers Dialog */}
								<FollowersDialog
									userId={initialUser.id}
									followersCount={followersQuery.count}
									isLoading={followersQuery.isLoading}
								/>
								{/* Following Dialog */}
								<FollowingDialog
									userId={initialUser.id}
									followingCount={followingQuery.count}
									isLoading={followingQuery.isLoading}
								/>
							</div>
						</div>

						{/* Posts Section */}
						<div className="mt-12">
							<div className="flex items-center justify-center gap-3 mb-8 group">
								<Separator className="w-24 transition-all duration-300 group-hover:w-32" />
								<Sparkles className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
								<span className="text-lg font-semibold transition-colors duration-300 group-hover:text-primary">
									Posts
								</span>
								<Sparkles className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
								<Separator className="w-24 transition-all duration-300 group-hover:w-32" />
							</div>
							<div className="">
								{isLoading ? (
									<div className="">
										<Skeleton className="h-32 w-full rounded-lg" />
										<Skeleton className="h-32 w-full rounded-lg" />
										<Skeleton className="h-32 w-full rounded-lg" />
									</div>
								) : (
									<div>
										{posts.map((post) => (
											<Post key={post.id} {...post} />
										))}
										{posts.length === 0 && (
											<div className="text-center py-12 rounded-lg bg-primary/5">
												<p className="text-lg text-muted-foreground">No posts yet</p>
												<p className="text-sm text-muted-foreground mt-1">
													Share your thoughts with the world!
												</p>
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
