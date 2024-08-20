import { Avatar, AvatarFallback, AvatarImage } from "@components/atoms/avatar"
import { AvatarStack } from "@components/atoms/avatar-stack"
import { Button } from "@components/atoms/button"
import FollowButton from "@components/molecules/button/follow-button"
import Post from "@components/molecules/post"
import { getUser } from "@prisma/functions/user"
import { getAllUserPosts } from "@prisma/functions/user/post"
import type { PostProps } from "@prisma/global"
import { firstLetterToUpper } from "@utils/string.helpers"
import { createSupabaseClientWithCookies } from "@utils/supabase/server"

export default async function UserPage({ params }: { params: { id: string } }) {
	// App user, the main user
	const supabase = createSupabaseClientWithCookies()
	const {
		data: { user: appUser },
	} = await supabase.auth.getUser()

	// Viewing user, another person
	const viewingUser = await getUser(params.id)

	// Get all posts by the viewing user
	let posts: PostProps[] = []
	if (viewingUser) {
		const data = await getAllUserPosts({ userId: viewingUser.id })
		if (data) posts = data
	}

	// TODO: replace with actual avatars
	const avatars = [
		{ name: "a", image: "https://github.com/shadcn.png" },
		{ name: "a", image: "https://github.com/shadcn.png" },
		{ name: "a", image: "https://github.com/shadcn.png" },
		{ name: "a", image: "https://github.com/shadcn.png" },
	]

	return (
		<>
			<div>
				<div className="mt-5 flex-between px-4">
					<div className="text-start">
						<h1 className="text-3xl text-bold">
							{viewingUser
								? firstLetterToUpper(viewingUser.fullName)
								: "Unknown User"}
						</h1>
						<h2 className="text-gray-400">
							@{viewingUser?.userName ?? "unknown"}
						</h2>
					</div>

					<div className="">
						<Avatar className="h-24 w-24">
							<AvatarImage
								src={
									viewingUser?.avatarUrl ??
									"https://static.vecteezy.com/system/resources/thumbnails/025/337/669/small_2x/default-male-avatar-profile-icon-social-media-chatting-online-user-free-vector.jpg"
								}
							/>
							<AvatarFallback>Piz</AvatarFallback>
						</Avatar>
					</div>
				</div>

				<div className="mt-5 flex-start-center gap-5 px-4">
					<AvatarStack avatars={avatars} showHiddenAvatarLength={false} />
					<p>18 followers</p>
				</div>

				{/* if the user viewing profile is the main user */}
				{viewingUser?.id === appUser?.id ? (
					<Button variant="outline" className="mt-5 w-full">
						Edit profile
					</Button>
				) : (
					<>
						{appUser && viewingUser ? (
							<FollowButton
								followerId={appUser.id} // Follower is the main user
								followeeId={viewingUser.id} // Followee is the viewing user, the person is requested to follow
							/>
						) : (
							<Button disabled>Follow</Button>
						)}
					</>
				)}

				{/* user posts */}
				{posts.map(
					({
						id,
						userId,
						userName,
						userAvatarUrl,
						content,
						visibility,
						createdAt,
						updatedAt,
						isDeleted,
					}) => (
						<Post
							key={id} // no need to pass
							id={id}
							userId={userId}
							userName={userName}
							userAvatarUrl={userAvatarUrl}
							content={content}
							visibility={visibility}
							createdAt={createdAt}
							updatedAt={updatedAt}
							isDeleted={isDeleted}
						/>
					),
				)}
			</div>
		</>
	)
}
