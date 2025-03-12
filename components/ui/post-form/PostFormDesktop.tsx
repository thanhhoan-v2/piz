"use client"

import { Button } from "@components/ui/Button"
import { Separator } from "@components/ui/Separator"
import { postWidths } from "@components/ui/post"
import { useUser } from "@stackframe/stack"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@utils/cn"
import { queryKey } from "@utils/queryKeyFactory"
import { RefreshCw } from "lucide-react"
import PostForm from "./PostForm"

export default function PostFormDesktop() {
	const queryClient = useQueryClient()
	const user = useUser()

	const handleRefetchPosts = () =>
		queryClient.invalidateQueries({
			queryKey: queryKey.post.all,
			exact: true,
			refetchType: "all",
		})

	return (
		<>
			<div className={cn("flex-column gap-[10px]", postWidths)}>
				<PostForm>
					<Button className="gap-2 bg-background-item hover:bg-background shadow-lg py-[33px] rounded-lg w-full text-black dark:text-white text-xl">
						{/* <Sparkle className="text-pink-400" /> */}
						<p>
							{user?.displayName
								? `What are you thinking, ${user.displayName}? 🤔`
								: "Sign in to create a post"}
						</p>
						{/* <Sparkle className="text-pink-400" /> */}
					</Button>
				</PostForm>
			</div>

			<div className="flex-center gap-3 my-4">
				<Separator className="w-1/3" />
				<RefreshCw
					onClick={handleRefetchPosts}
					size={15}
					className="text-[#272727] hover:text-white cursor-pointer"
				/>
				<Separator className="w-1/3" />
			</div>
		</>
	)
}
