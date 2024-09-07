import PostUserInfo from "@components/molecules/post/post-user-info"
import type { Comment } from "@prisma/client"

export default function PostComment({
	id,
	userId,
	postId,
	degree,
	parentId,
	content,
	createdAt,
	updatedAt,
	isDeleted,
	userName,
	userAvatarUrl,
}: Comment) {
	return (
		<>
			<PostUserInfo
				isWriteOnly
				userName={userName}
				userAvatarUrl={userAvatarUrl}
				appUserName={userName}
				createdAt={new Date()}
				updatedAt={null}
			/>
			<div>{degree}</div>
			<div>{content}</div>
		</>
	)
}
