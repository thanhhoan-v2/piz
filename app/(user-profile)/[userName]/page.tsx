import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/Avatar"
import { AvatarStack } from "@components/ui/AvatarStack"
import { Button } from "@components/ui/Button"
import FollowButton from "@components/ui/button/FollowButton"
import Post from "@components/ui/post"
import { useSupabaseServer } from "@hooks/supabase/server"
import type { Post as IPost } from "@prisma/client"
import {
	countUserFollowers,
	getFirstThreeFollowerAvatarUrls,
} from "@queries/server/follow"
import { getAllUserPosts } from "@queries/server/post"
import { getViewingUserInfo } from "@queries/server/user"
import { cn } from "@utils/cn"
import { avatarPlaceholder } from "@utils/image.helpers"
import { firstLetterToUpper } from "@utils/string.helpers"
import type { Metadata } from "next"

export async function generateMetadata({
	params,
}: {
	params: { userName: string }
}): Promise<Metadata> {
	const userName = params.userName
	return {
		title: `${userName} ✧ Piz`,
		description: `Profile page of user ${userName}.`,
	}
}

export default async function UserPage({
	params,
}: { params: { userName: string } }) {
	const userName = params.userName

	// App user, the main user
	const supabase = useSupabaseServer()
	const {
		data: { user: appUser },
	} = await supabase.auth.getUser()

	// Viewing user, another person
	const viewingUser = await getViewingUserInfo(userName)

	// Get all posts by the viewing user
	let posts: IPost[] = []
	if (viewingUser) {
		const data = await getAllUserPosts(viewingUser.id)
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
		if (data) noFollowers = data
	}

	return (
		<>
			<div>
				<div
					className={cn("mt-[100px] laptop:w-[650px] flex-between gap-5 px-4")}
				>
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
