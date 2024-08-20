import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@components/atoms/alert-dialog"
import { Avatar, AvatarFallback } from "@components/atoms/avatar"
import { Badge } from "@components/atoms/badge"
import { Button } from "@components/atoms/button"
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@components/atoms/drawer"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@components/atoms/select"
import { Textarea } from "@components/atoms/textarea"
import { $Enums } from "@prisma/client"
import { createPost } from "@prisma/functions/post"
import { useUserStore } from "@stores/user-store"
import { cn } from "@utils/cn"
import { HashIcon, ImageIcon, MenuIcon } from "lucide-react"
import React from "react"

export default function SideBarMobileDrawer({
	children,
}: {
	children: React.ReactNode
}) {
	// Drawer for creating a post
	const [isDrawerOpen, setOpenDrawer] = React.useState<boolean>(false)

	// Alert dialog for discarding comment
	const [alertIsOpen, setOpenAlert] = React.useState<boolean>(false)

	// Post
	const [postContent, setPostContent] = React.useState("")
	// Post visibility
	const [postVisibility, setPostVisibility] =
		React.useState<$Enums.PostVisibility>("PUBLIC")

	// Reference to textarea
	const textareaRef = React.useRef<HTMLTextAreaElement>(null)

	// User store values
	const userId = useUserStore((state) => state.userId)
	const userName = useUserStore((state) => state.userName)
	const userAvatarUrl = useUserStore((state) => state.userAvatarUrl)

	// Post length, mid warning
	const mid_threshold = 500
	// and last warning
	const last_threshold = 550

	// Handles post content
	const handleChange = React.useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setPostContent(e.target.value)
		},
		[],
	)

	// Handles the alert dialog to discard comment
	const handleOpenAlert = () => {
		// If the value is not empty, open the alert
		if (postContent.length > 0) {
			setOpenAlert(true)
		}
	}

	// Handles post submission
	const handleSubmitPost = async () => {
		// Create post on server
		await createPost({
			userId: userId,
			userName: userName,
			userAvatarUrl: userAvatarUrl,
			content: postContent,
			visibility: postVisibility,
		})
		// Close the drawer
		setOpenDrawer(false)
		// Reset the post content
		setPostContent("")
		// Reset the post visibility
		setPostVisibility("PUBLIC")
	}

	// Handles the discard post
	const handleDiscard = () => {
		setOpenDrawer(false)
		setPostContent("")
		setPostVisibility("PUBLIC")
	}

	// Textarea auto increases its height on value length
	// biome-ignore lint/correctness/useExhaustiveDependencies: value is only needed here
	React.useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto"
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
		}
	}, [postContent])

	return (
		<>
			<Drawer open={isDrawerOpen} onOpenChange={setOpenDrawer}>
				<DrawerTrigger>{children}</DrawerTrigger>

				<DrawerContent
					className="h-[90vh] bg-background-item dark:bg-background-item"
					onPointerDownOutside={handleOpenAlert}
				>
					{/* header */}
					<DrawerHeader>
						<DrawerTitle>New post</DrawerTitle>
						<DrawerDescription>What are you thinking?</DrawerDescription>
					</DrawerHeader>

					{/* body */}
					<div className="flex items-start gap-3 p-4">
						<Avatar className="h-12 w-12">
							{/* <AvatarImage src={user?.imageUrl} alt="User Avatar" /> */}
							<AvatarFallback>PIZ</AvatarFallback>
						</Avatar>

						<div className="flex w-full flex-col gap-2">
							<Badge className="w-fit">{userName}</Badge>

							{/* form */}
							<div className="w-full flex-start flex-col gap-2">
								<Textarea
									ref={textareaRef}
									value={postContent}
									onChange={handleChange}
									placeholder="Type here ..."
									className=" resize-none border-none p-0 focus-visible:ring-0"
								/>
								<div className="flex space-x-4">
									<ImageIcon />
									<HashIcon />
									<MenuIcon />
								</div>
							</div>
						</div>
					</div>

					{/* footer */}
					<DrawerFooter>
						<div className="flex-between ">
							{/* Select post visibility */}
							<Select
								onValueChange={(value: $Enums.PostVisibility) =>
									setPostVisibility(value)
								}
							>
								<SelectTrigger className="w-fit gap-2">
									<SelectValue placeholder="Anyone can view" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={$Enums.PostVisibility.PUBLIC}>
										Anyone can view
									</SelectItem>
									<SelectItem value={$Enums.PostVisibility.FOLLOWERS_ONLY}>
										Only followers can view
									</SelectItem>
									<SelectItem value={$Enums.PostVisibility.MENTIONED_ONLY}>
										Only metioned users can view
									</SelectItem>
									<SelectItem value={$Enums.PostVisibility.FANS_ONLY}>
										Only fans can view 🔞
									</SelectItem>
									<SelectItem value={$Enums.PostVisibility.ME_ONLY}>
										Only you can view, because you are an introvert 😃
									</SelectItem>
								</SelectContent>
							</Select>

							{/* Controls post length */}
							{postContent.length >= mid_threshold && (
								<div
									className={cn(
										"w-[100px] text-center font-black",
										postContent.length > last_threshold && "text-red-500",
									)}
								>
									{last_threshold - postContent.length}
								</div>
							)}

							{/* Post button */}
							<Button
								className="w-[100px]"
								disabled={
									postContent.length > last_threshold ||
									postContent.length === 0
								}
								onClick={handleSubmitPost}
							>
								Post
							</Button>
						</div>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>

			{/* show when value is not empty */}
			<AlertDialog open={alertIsOpen} onOpenChange={setOpenAlert}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Discard comment ?</AlertDialogTitle>
						<AlertDialogDescription />
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setOpenDrawer(true)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction onClick={handleDiscard}>
							Discard
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
