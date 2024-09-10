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
} from "@components/ui/AlertDialog"
import { Button } from "@components/ui/Button"
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@components/ui/Drawer"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@components/ui/Select"
import { Textarea } from "@components/ui/Textarea"
import WelcomeModal from "@components/ui/modal/WelcomeModal"
import PostUserInfo from "@components/ui/post/PostUserInfo"
import { faker } from "@faker-js/faker"
import type { Post } from "@prisma/client"
import { type CreatePostProps, createPost } from "@queries/server/post"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@utils/cn"
import { queryKey } from "@utils/queryKeyFactory"
import { generateBase64uuid } from "@utils/uuid.helpers"
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

	const addPostMutation = useMutation({
		mutationKey: queryKey.post.insert(),
		mutationFn: async (newPost: CreatePostProps) => await createPost(newPost),
		onMutate: async (newPost) => {
			// Cancel any outgoing refetches to not overwrite our optimistic updates
			await queryClient.cancelQueries({ queryKey: queryKey.post.all })

			// Snapshot the previous value
			const previousPosts = queryClient.getQueryData(queryKey.post.all)

			queryClient.setQueryData(queryKey.post.all, (old: Post[]) => [
				newPost,
				...old,
			])
			queryClient.setQueryData(queryKey.post.selectCount(newPost.id), {
				noReactions: 0,
				noShares: 0,
				noComments: 0,
			})
			queryClient.setQueryData(
				queryKey.post.selectReactionByUser({ userId, postId: newPost.id }),
				null,
			)

			// Return a context object with the snapshotted value
			return { previousPosts }
		},
		onError: (error) => {
			console.error("Error creating post:", error)
		},
		onSettled: (newPost) => {
			if (newPost) {
				queryClient.invalidateQueries({
					queryKey: [
						queryKey.post.selectId(newPost.id),
						queryKey.post.selectCount(newPost.id),
						queryKey.post.selectReactionByUser({
							userId: newPost.userId,
							postId: newPost.id,
						}),
					],
				})
			}
		},
	})

	const handleSubmitPost = () => {
		const date = new Date()

		const newPost: CreatePostProps = {
			id: generateBase64uuid(),
			userId: userId ?? null,
			userName: userName,
			userAvatarUrl: userAvatarUrl,
			content: postContent,
			visibility: postVisibility,
			createdAt: date,
		}
		addPostMutation.mutate(newPost)
		setOpenDrawer(false)
		setPostContent("")
		setPostVisibility("PUBLIC")
	}

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
