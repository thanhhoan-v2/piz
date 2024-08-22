"use client"
import { Avatar, AvatarImage } from "@components/atoms/avatar"
import { Input } from "@components/atoms/input"
import PostForm from "@components/organisms/side-bar/post-form"
import { useUserStore } from "@stores/user-store"

export default function PostFormDesktop() {
	const userAvatarUrl = useUserStore((state) => state.userAvatarUrl)
	return (
		<>
			<PostForm>
				<div className="flex-center gap-3 rounded-lg bg-background-item p-3">
					<Avatar>
						<AvatarImage
							src={
								userAvatarUrl ??
								"https://static.vecteezy.com/system/resources/thumbnails/025/337/669/small_2x/default-male-avatar-profile-icon-social-media-chatting-online-user-free-vector.jpg"
							}
						/>
					</Avatar>
					<Input placeholder="What's happening?" className="" />
				</div>
			</PostForm>
		</>
	)
}
