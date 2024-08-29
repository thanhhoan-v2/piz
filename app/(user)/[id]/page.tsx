import { Avatar, AvatarFallback, AvatarImage } from "@components/atoms/avatar"
import { AvatarStack } from "@components/atoms/avatar-stack"
import { Button } from "@components/atoms/button"
import FollowButton from "@components/molecules/button/follow-button"
import Post from "@components/molecules/post"
import { avatarPlaceholder } from "@constants/image-placeholder"
import { getViewingUserInfo } from "@prisma/functions/user"
import {
	countUserFollowers,
	getFirstThreeFollowerAvatarUrls,
} from "@prisma/functions/user/follow"
import { getAllUserPosts } from "@prisma/functions/user/post"
import type { PrismaPost } from "@prisma/global"
import { firstLetterToUpper } from "@utils/string.helpers"
import { createSupabaseClientWithCookies } from "@utils/supabase/server"

export default async function UserPage({ params }: { params: { id: string } }) {
	// App user, the main user
	const supabase = createSupabaseClientWithCookies()
	const {
		data: { user: appUser },
	} = await supabase.auth.getUser()

	// Viewing user, another person
	const viewingUser = await getViewingUserInfo(params.id)

	// Get all posts by the viewing user
	let posts: PrismaPost[] = []
	if (viewingUser) {
		const data = await getAllUserPosts({ userId: viewingUser.id })
		if (data) posts = data
	}

	// Get the first three follower avatar urls for AvatarStack
	let firstThreeAvatarUrls: { name: string; image: string }[] = []
	if (appUser) {
		const data = await getFirstThreeFollowerAvatarUrls({ userId: appUser.id })
		if (data) firstThreeAvatarUrls = data
	}

	// Get number of followers
	let noFollowers = 0
	if (appUser) {
		const data = await countUserFollowers({ userId: appUser.id })
		console.log(data)
		if (data) noFollowers = data
	}

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
							<AvatarImage src={viewingUser?.avatarUrl ?? avatarPlaceholder} />
							<AvatarFallback>Piz</AvatarFallback>
						</Avatar>
					</div>
				</div>

				<div className="mt-5 flex-start-center gap-5 px-4">
					<AvatarStack
						avatars={firstThreeAvatarUrls}
						showHiddenAvatarLength={false}
					/>
					<p>{noFollowers} followers</p>
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
				<div className="mt-5">
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
			</div>
		</>
	)
}
