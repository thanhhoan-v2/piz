"use client"
import { Avatar, AvatarImage } from "@components/atoms/avatar"
import { Input } from "@components/atoms/input"
import SideBarMobileDrawer from "@components/organisms/side-bar/side-bar-mobile-drawer"
import { useUserStore } from "@stores/user-store"

export default function PostFormDesktop() {
	const userAvatarUrl = useUserStore((state) => state.userAvatarUrl)
	console.log(userAvatarUrl)
	return (
		<>
			<SideBarMobileDrawer>
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
			</SideBarMobileDrawer>
		</>
	)
}
