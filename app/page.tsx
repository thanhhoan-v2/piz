import Post from "@components/molecules/post"
import PostFormDesktop from "@components/molecules/post/post-form-desktop"
import { getAllPosts } from "@prisma/functions/post"

export default async function HomePage() {
	const posts = await getAllPosts()

	return (
		<>
			<div className="flex-col gap-2">
				<PostFormDesktop />
				<div>
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
								key={id}
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
