import { PostVisibilityEnumMap, type PostVisibilityEnumType } from "@/types/post.types"
import { Button } from "@components/ui/Button"
import { DrawerFooter } from "@components/ui/Drawer"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@components/ui/Select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip"
import { CodeXml, FileVideoIcon, ImageIcon } from "lucide-react"

interface PostFormFooterProps {
	setPostVisibility: (value: PostVisibilityEnumType) => void
	setIsAddingImage: (value: boolean) => void
	setIsAddingVideo: (value: boolean) => void
	setIsAddingSnippet: (value: boolean) => void
	setAlertSnippetDiscard: (value: boolean) => void
	handleSubmitPost: () => void
	handleFakePost: () => void
	isAddingImage: boolean
	isAddingVideo: boolean
	isAddingSnippet: boolean
	isSnippetPreviewed: boolean
}

export function PostFormFooter({
	setPostVisibility,
	setIsAddingImage,
	setIsAddingVideo,
	setIsAddingSnippet,
	setAlertSnippetDiscard,
	handleSubmitPost,
	handleFakePost,
	isAddingImage,
	isAddingVideo,
	isAddingSnippet,
	isSnippetPreviewed,
}: PostFormFooterProps) {
	const storedPostImageUrl = localStorage.getItem("postImageUrl")
	const storedPostVideoUrl = localStorage.getItem("postVideoUrl")

	return (
		<DrawerFooter>
			<div className="flex-between">
				<div className="flex-center gap-2">
					<Select onValueChange={(value: PostVisibilityEnumType) => setPostVisibility(value)}>
						<SelectTrigger className="gap-2 w-fit">
							<SelectValue placeholder="Anyone can see" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={PostVisibilityEnumMap.PUBLIC}>Anyone can see</SelectItem>
							<SelectItem value={PostVisibilityEnumMap.ME_ONLY}>Only me can see</SelectItem>
						</SelectContent>
					</Select>

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									onClick={() => setIsAddingImage(true)}
									disabled={isAddingImage || isAddingVideo || isAddingSnippet}
								>
									<ImageIcon />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Add image</p>
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									onClick={() => setIsAddingVideo(true)}
									disabled={isAddingImage || isAddingVideo || isAddingSnippet}
								>
									<FileVideoIcon />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Add video</p>
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									disabled={isAddingImage || isAddingVideo || isAddingSnippet}
									onClick={() => {
										if (isAddingSnippet) setAlertSnippetDiscard(true)
										else setIsAddingSnippet(!isAddingSnippet)
									}}
								>
									<CodeXml />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Add code snippet</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<div className="w-[100px] h-[10px]" onClick={handleFakePost} />
				</div>

				<div className="flex gap-4">
					<Button
						className="w-[100px]"
						onClick={handleSubmitPost}
						disabled={
							(isAddingImage && storedPostImageUrl == undefined) ||
							(isAddingVideo && storedPostVideoUrl == undefined) ||
							(isAddingSnippet && !isSnippetPreviewed)
						}
					>
						Post
					</Button>
				</div>
			</div>
		</DrawerFooter>
	)
}
