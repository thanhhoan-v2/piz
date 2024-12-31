"use client"

import { userAtom } from "@atoms/user"
import { Avatar, AvatarImage } from "@components/ui/Avatar"
import { Input } from "@components/ui/Input"
import PostForm from "@components/ui/form/PostForm"
import { useAtomValue } from "jotai"

export default function PostFormDesktop() {
	const user = useAtomValue(userAtom)
	const userAvatarUrl = user?.user_metadata?.avatar_url
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
					<Input placeholder="Share your new idea" className="" />
				</div>
			</PostForm>
		</>
	)
}
