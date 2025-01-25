"use client"
import { Avatar, AvatarImage } from "@components/ui/Avatar"
import { Input } from "@components/ui/Input"
import { Separator } from "@components/ui/Separator"
import PostForm from "@components/ui/form/PostForm"
import { postWidths } from "@components/ui/post"
import { useUser } from "@stackframe/stack"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@utils/cn"
import { queryKey } from "@utils/queryKeyFactory"
import { RefreshCw } from "lucide-react"

export default function PostFormDesktop() {
	const user = useUser()
	const userAvatarUrl = user?.profileImageUrl
	const queryClient = useQueryClient()

	const handleRefetchPosts = () => {
		queryClient.invalidateQueries({
			queryKey: queryKey.post.all,
			exact: true,
			refetchType: "all",
		})
	}

	return (
		<>
			<PostForm>
				<div
					className={cn(
						"flex-center gap-3 rounded-lg bg-background-item p-3",
						postWidths,
					)}
				>
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
			<div className="my-4 flex-center gap-3">
				<Separator className="w-1/3" />
				<RefreshCw
					onClick={handleRefetchPosts}
					size={15}
					className="cursor-pointer text-[#272727] hover:text-white"
				/>
				<Separator className="w-1/3" />
			</div>
		</>
	)
}
