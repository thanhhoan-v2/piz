"use client"

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
import { POST } from "@constants/query-key"
import { useQueryAppUser } from "@hooks/queries/app-user"
import { $Enums } from "@prisma/client"
import { type CreatePostProps, createPost } from "@prisma/functions/post"
import type { PostProps } from "@prisma/global"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@utils/cn"
import { HashIcon, ImageIcon, MenuIcon } from "lucide-react"
import React from "react"

export default function PostForm({
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

	// Handles post content
	const handleChange = React.useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setPostContent(e.target.value)
		},
		[],
	)

	// Handles the discard post
	const handleDiscard = () => {
		setOpenDrawer(false)
		setPostContent("")
		setPostVisibility("PUBLIC")
	}

	// Handles the alert dialog to discard comment
	const handleOpenAlert = () => {
		// If the value is not empty, open the alert
		if (postContent.length > 0) {
			setOpenAlert(true)
		}
	}

	const queryClient = useQueryClient()

	// Get the lastet info of current user
	// Why not useQueryClient() ? Because cache data may not be the lastest data
	const { data: user } = useQueryAppUser()
	const userId = user?.id
	const userName = user?.user_metadata?.user_name
	const userAvatarUrl = user?.user_metadata?.avatar_url

	// React Query mutation to update the posts
	// Update both on server and client (optimistic update)
	const addPostMutation = useMutation({
		mutationKey: [POST.ADD],
		mutationFn: async (newPost: CreatePostProps) => await createPost(newPost),
		// Always refetch when the mutation is successful
		onSuccess: () => {
			// Invalidate the posts query to ensure consistency with the server
			queryClient.invalidateQueries({ queryKey: [POST.ALL] })
		},
		// Always refetch after error or success
		onSettled: async () => {
			return await queryClient.invalidateQueries({ queryKey: [POST.ALL] })
		},
		// // Optimistic update
		onMutate: async (newPost) => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({ queryKey: [POST.ALL] })

			// Snapshot the previous value
			const previousPosts = queryClient.getQueryData([POST.ALL])

			// Optimistically update to the new value
			queryClient.setQueryData([POST.ALL], (old: PostProps[]) => [
				...old,
				newPost,
			])

			// Return a context object with the snapshotted value
			return { previousPosts }
		},
		onError: (error) => {
			console.error("Error creating post:", error)
		},
	})

	// Handles post submission
	const handleSubmitPost = () => {
		// Create post on server
		const newPost: CreatePostProps = {
			userId: userId ?? null,
			userName: userName,
			userAvatarUrl: userAvatarUrl,
			content: postContent,
			visibility: postVisibility,
		}
		addPostMutationAsync(newPost)
		// Close the drawer
		setOpenDrawer(false)
		// Reset the post content
		setPostContent("")
		// Reset the post visibility
		setPostVisibility("PUBLIC")
	}

	const addPostMutationAsync = async (newPost: CreatePostProps) =>
		await addPostMutation.mutateAsync(newPost)

	// Post length, mid warning
	const mid_threshold = 500
	// and last warning
	const last_threshold = 550

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
