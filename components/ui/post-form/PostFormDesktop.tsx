"use client"

import { Button } from "@components/ui/Button"
import { Separator } from "@components/ui/Separator"
import { postWidths } from "@components/ui/post"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@utils/cn"
import { queryKey } from "@utils/queryKeyFactory"
import { RefreshCw, Sparkle } from "lucide-react"
import PostForm from "./PostForm"

export default function PostFormDesktop() {
	const queryClient = useQueryClient()

	const handleRefetchPosts = () =>
		queryClient.invalidateQueries({
			queryKey: queryKey.post.all,
			exact: true,
			refetchType: "all",
		})

	return (
		<>
			<div className={cn("flex-center gap-3", postWidths)}>
				<PostForm>
					<Button className="w-full gap-2 rounded-lg border-2 border-pink-400 bg-background-item py-[33px] text-black text-xl shadow-lg hover:bg-background dark:text-white">
						<Sparkle className="text-pink-400" />
						<p>Create new post</p>
						<Sparkle className="text-pink-400" />
					</Button>
				</PostForm>
			</div>

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
