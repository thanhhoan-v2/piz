"use client"

import { userAtom } from "@atoms/user"
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
import WelcomeModal from "@components/molecules/modal/welcome-modal"
import PostUserInfo from "@components/molecules/post/post-user-info"
import { POST } from "@constants/query-key"
import { faker } from "@faker-js/faker"
import type { Post } from "@prisma/client"
import { type CreatePostProps, createPost } from "@prisma/functions/post"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@utils/cn"
import { useAtomValue } from "jotai"
import { HashIcon, ImageIcon, MenuIcon } from "lucide-react"
import React from "react"

export type PostVisibilityEnumType =
	| "PUBLIC"
	| "FOLLOWERS_ONLY"
	| "MENTIONED_ONLY"
	| "FANS_ONLY"
	| "ME_ONLY"

export const PostVisibilityEnumMap = {
	PUBLIC: "PUBLIC",
	FOLLOWERS_ONLY: "FOLLOWERS_ONLY",
	MENTIONED_ONLY: "MENTIONED_ONLY",
	FANS_ONLY: "FANS_ONLY",
	ME_ONLY: "ME_ONLY",
}

export const PostVisibilityEnumArray = [
	"PUBLIC",
	"FOLLOWERS_ONLY",
	"MENTIONED_ONLY",
	"FANS_ONLY",
	"ME_ONLY",
]

export default function PostForm({
	children,
}: {
	children: React.ReactNode
}) {
	const [isDrawerOpen, setOpenDrawer] = React.useState<boolean>(false)
	const [alertIsOpen, setOpenAlert] = React.useState<boolean>(false)
	const [postContent, setPostContent] = React.useState("")
	const [postVisibility, setPostVisibility] =
		React.useState<PostVisibilityEnumType>("PUBLIC")
	const textareaRef = React.useRef<HTMLTextAreaElement>(null)

	const handleChange = React.useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setPostContent(e.target.value)
		},
		[],
	)

	const handleDiscard = () => {
		setOpenDrawer(false)
		setPostContent("")
		setPostVisibility("PUBLIC")
	}

	const handleOpenAlert = () => {
		// If the value is not empty, open the alert
		if (postContent.length > 0) {
			setOpenAlert(true)
		}
	}

	const handleFakePost = () => {
		const fake_content: string = faker.lorem.paragraphs()
		const fake_visibility: PostVisibilityEnumType = PostVisibilityEnumArray[
			Math.floor(Math.random() * PostVisibilityEnumArray.length)
		] as PostVisibilityEnumType

		setPostContent(fake_content)
		setPostVisibility(fake_visibility)
	}

	const queryClient = useQueryClient()
	const user = useAtomValue(userAtom)
	const userId = user?.id
	const userName = user?.user_metadata?.userName
	const fullName = user?.user_metadata?.fullName
	const userAvatarUrl = user?.user_metadata?.avatarUrl

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
			queryClient.setQueryData([POST.ALL], (old: Post[]) => [newPost, ...old])

			// Return a context object with the snapshotted value
			return { previousPosts }
		},
		onError: (error) => {
			console.error("Error creating post:", error)
		},
	})

	const handleSubmitPost = () => {
		const newPost: CreatePostProps = {
			userId: userId ?? null,
			userName: userName,
			userAvatarUrl: userAvatarUrl,
			content: postContent,
			visibility: postVisibility,
		}
		addPostMutationAsync(newPost)
		setOpenDrawer(false)
		setPostContent("")
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

	if (!user) return <WelcomeModal>{children}</WelcomeModal>

	return (
		<>
			<Drawer open={isDrawerOpen} onOpenChange={setOpenDrawer}>
				<DrawerTrigger asChild>{children}</DrawerTrigger>

				<DrawerContent
					className="h-[90vh] bg-background-item dark:bg-background-item"
					onPointerDownOutside={handleOpenAlert}
				>
					{/* header */}
					<DrawerHeader>
						<DrawerTitle>New post</DrawerTitle>
						<DrawerDescription>What are you thinking?</DrawerDescription>
					</DrawerHeader>
					<div className="flex-col items-start gap-3 p-4">
						<PostUserInfo
							isWriteOnly
							userName={userName}
							userAvatarUrl={userAvatarUrl}
							visibility={postVisibility}
							appUserName={userName}
							createdAt={new Date()}
							updatedAt={null}
						/>
						<div className="mb-8 w-full flex-start flex-col gap-2">
							<Textarea
								autoFocus
								ref={textareaRef}
								value={postContent}
								onChange={handleChange}
								placeholder={cn("Dear ", fullName, ", what is in your mind ?")}
								className=" min-h-[10px] resize-none border-none p-0 focus-visible:ring-0"
							/>
							<div className="flex space-x-4">
								<ImageIcon />
								<HashIcon />
								<MenuIcon />
							</div>
						</div>
					</div>

					<DrawerFooter>
						<div className="flex-between ">
							{/* Select post visibility */}
							<Select
								onValueChange={(value: PostVisibilityEnumType) =>
									setPostVisibility(value)
								}
							>
								<SelectTrigger className="w-fit gap-2">
									<SelectValue placeholder="Anyone can view" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={PostVisibilityEnumMap.PUBLIC}>
										Anyone can view
									</SelectItem>
									<SelectItem value={PostVisibilityEnumMap.FOLLOWERS_ONLY}>
										Only followers can view
									</SelectItem>
									<SelectItem value={PostVisibilityEnumMap.MENTIONED_ONLY}>
										Only metioned users can view
									</SelectItem>
									<SelectItem value={PostVisibilityEnumMap.FANS_ONLY}>
										Only fans can view 🔞
									</SelectItem>
									<SelectItem value={PostVisibilityEnumMap.ME_ONLY}>
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
							<div className="flex gap-4">
								<Button onClick={handleFakePost}>Fake</Button>
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
