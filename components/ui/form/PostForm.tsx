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
} from "@components/ui/AlertDialog"
import { Badge } from "@components/ui/Badge"
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
import { Textarea } from "@components/ui/Textarea"
import WelcomeModal from "@components/ui/modal/WelcomeModal"
import type { SearchResultProps } from "@components/ui/search/SearchList"
import SearchList from "@components/ui/search/SearchList"
import { useToast } from "@components/ui/toast/useToast"
import { faker } from "@faker-js/faker"
import type { Post } from "@prisma/client"
import { type CreatePostProps, createPost } from "@queries/server/post"
import { useUser } from "@stackframe/stack"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@utils/cn"
import { queryKey } from "@utils/queryKeyFactory"
import { generateBase64uuid } from "@utils/uuid.helpers"
import { Sparkles } from "lucide-react"
import React from "react"
import { getUserById } from "../../../app/actions/user"
import { Input } from "../Input"
import { Separator } from "../Separator"

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

type IMentionedResult = {
	id: string
	userName: string
}

export default function PostForm({
	children,
}: {
	children: React.ReactNode
}) {
	const [isDrawerOpen, setOpenDrawer] = React.useState<boolean>(false)
	const [alertIsOpen, setOpenAlert] = React.useState<boolean>(false)
	const [postTitle, setPostTitle] = React.useState("")
	const [postContent, setPostContent] = React.useState("")
	const textareaRef = React.useRef<HTMLTextAreaElement>(null)
	const [postVisibility, setPostVisibility] =
		React.useState<PostVisibilityEnumType>("PUBLIC")

	const [showMentionSuggestions, setShowMentionSuggestions] =
		React.useState<boolean>(false)
	const [startMentionIndex, setStartMentionIndex] = React.useState<number>(-1)
	const [lastMentionIndexes, setLastMentionIndexes] = React.useState<number[]>(
		[],
	)
	const [mentionSearchValue, setMentionSearchValue] = React.useState<string>("")
	const [mentionedUsers, setMentionedUsers] = React.useState<
		IMentionedResult[]
	>([])
	const [isSearching, setIsSearching] = React.useState<boolean>(false)
	const [searchResults, setSearchResults] = React.useState<SearchResultProps>(
		[],
	)
	const [posterInfo, setPosterInfo] = React.useState<{
		userName: string
		avatarUrl: string
		userId: string
	}>()
	const user = useUser()
	const userId = user?.id
	const userAvatarUrl = user?.profileImageUrl
	const { toast } = useToast()

	// Fetch user info when userId changes
	React.useEffect(() => {
		const fetchUserInfo = async () => {
			if (userId) {
				const userInfo = await getUserById(userId)
				setPosterInfo(userInfo)
			}
		}
		fetchUserInfo()
	}, [userId])

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value
		setPostContent(newValue)

		const lastAtIndex = newValue.lastIndexOf("@")
		if (lastAtIndex !== -1 && lastAtIndex === newValue.length - 1) {
			// Show suggestions when '@' is the last character typed
			setShowMentionSuggestions(true)
			setStartMentionIndex(lastAtIndex)
			setMentionSearchValue("")
		} else if (lastAtIndex === -1 || lastAtIndex < startMentionIndex) {
			// Reset if "@" is removed or not valid for mentioning anymore
			setShowMentionSuggestions(false)
			setMentionSearchValue("")
			setLastMentionIndexes([])
			setStartMentionIndex(-1)
			deleteLastMentionedUser()
		} else {
			// Extract mention and handle if space exists after "@" (i.e., invalidating the mention)
			const mention = newValue.substring(lastAtIndex + 1)
			if (mention.includes(" ")) {
				setMentionSearchValue("")
			} else {
				setMentionSearchValue(mention)
			}
		}

		// Handling previous mentions stored in lastMentionIndexes
		if (lastMentionIndexes.length > 0) {
			const lastMentionIndex = lastMentionIndexes[lastMentionIndexes.length - 1]
			const substringFromLastMentionIndex = newValue.slice(lastMentionIndex)

			// Check if we are still in mention mode after the last stored "@" mention
			if (
				newValue.length > lastMentionIndex &&
				!substringFromLastMentionIndex.includes(" ")
			) {
				setMentionSearchValue(substringFromLastMentionIndex)
				setShowMentionSuggestions(true)
			}

			if (
				postContent.length <
				lastMentionIndexes[lastMentionIndexes.length - 1] + 2
			) {
				deleteLastMentionedUser()
				deleteLastMentionIndex()
			}
		}
	}

	const deleteLastMentionedUser = () => {
		setMentionedUsers((prevMentionedUsers) => {
			const updatedMentionedUsers = [...prevMentionedUsers]
			updatedMentionedUsers.pop()
			return updatedMentionedUsers
		})
	}

	const deleteLastMentionIndex = () => {
		setLastMentionIndexes((prevIndexes) => {
			const updatedIndexes = [...prevIndexes]
			updatedIndexes.pop()
			return updatedIndexes
		})
	}

	const handleSelectUser = (id: string, userName: string) => {
		setMentionedUsers((prevMentionedUsers) => {
			const userExists = prevMentionedUsers.some((user) => user.id === id)
			if (!userExists) {
				return [
					...prevMentionedUsers,
					{
						id: id,
						userName: userName,
					},
				]
			}
			return prevMentionedUsers
		})

		setLastMentionIndexes((prevIndexes) => {
			const newIndex = startMentionIndex + userName.length
			const uniqueIndexes = new Set(prevIndexes)
			uniqueIndexes.add(newIndex)
			return Array.from(uniqueIndexes)
		})

		const beforeMention = postContent.slice(0, startMentionIndex)
		setPostContent(`${beforeMention}@${userName} `)
		setShowMentionSuggestions(false)
		setSearchResults([])
		setMentionSearchValue("")
		textareaRef.current?.focus()
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: handleSelectUser changes on every render
	React.useEffect(() => {
		// If search value matches search result
		if (mentionSearchValue.localeCompare(searchResults[0]?.userName) === 0) {
			handleSelectUser(searchResults[0].id, searchResults[0].userName)
		}
	}, [mentionSearchValue, searchResults])

	// biome-ignore lint/correctness/useExhaustiveDependencies: handleSearchvalue changes on every render
	React.useEffect(() => {
		if (mentionSearchValue.length > 0) {
			// handleSearchvalue(mentionSearchValue.toLowerCase())
		} else {
			setSearchResults([])
		}
	}, [mentionSearchValue])

	const handleDiscard = () => {
		setOpenDrawer(false)
		setPostTitle("")
		setPostContent("")
		setPostVisibility("PUBLIC")
		setSearchResults([])
		setMentionedUsers([])
		setShowMentionSuggestions(false)
		setStartMentionIndex(-1)
		setLastMentionIndexes([])
	}

	const handleTouchOutsideModal = () => {
		// If the value is not empty, open the alert
		if (postContent.length > 0) setOpenAlert(true)

		setSearchResults([])
		setMentionedUsers([])
		setShowMentionSuggestions(false)
	}

	const handleFakePost = () => {
		const fake_content: string = faker.lorem.paragraphs()
		const fake_title: string = faker.lorem.sentence(10)
		const fake_visibility: PostVisibilityEnumType = PostVisibilityEnumArray[
			Math.floor(Math.random() * PostVisibilityEnumArray.length)
		] as PostVisibilityEnumType

		setPostTitle(fake_title)
		setPostContent(fake_content)
		setPostVisibility(fake_visibility)
	}

	const queryClient = useQueryClient()

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
		onSuccess: () => {
			toast({
				title: "Success!",
				description: "Your post has been created.",
				// className: "bg-green-500",
			})
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: "Failed to create post. Please try again.",
				variant: "destructive",
			})
		},
	})

	const handleSubmitPost = () => {
		if (!user?.id) {
			toast({
				title: "Error",
				description: "You must be logged in to create a post",
				variant: "destructive",
			})
			return
		}

		const date = new Date()
		const newPost: CreatePostProps = {
			id: generateBase64uuid(),
			userId: user.id,
			userName: user.displayName,
			userAvatarUrl: user.profileImageUrl || null,
			title: postTitle,
			content: postContent,
			createdAt: date,
		}

		addPostMutation.mutate(newPost)
		setOpenDrawer(false)
		setPostTitle("")
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
					className="h-[90vh]  dark:bg-background-item"
					onPointerDownOutside={handleTouchOutsideModal}
				>
					{/* header */}
					<DrawerHeader>
						<DrawerTitle>New post</DrawerTitle>
						<DrawerDescription>What are you thinking?</DrawerDescription>
					</DrawerHeader>
					<div className="flex-col items-start gap-3 p-4">
						{/* <PostUserInfo
							isWriteOnly
							userName={posterInfo?.userName}
							userAvatarUrl={userAvatarUrl}
							visibility={postVisibility}
							appUserName={posterInfo?.userName}
							createdAt={new Date()}
							updatedAt={null}
						/> */}
						<div className="flex-y-center gap-2">
							{mentionedUsers.length > 0 &&
								mentionedUsers.map((mentionedUser) => (
									<>
										<Badge variant="outline" key={mentionedUser.id}>
											@{mentionedUser.userName}
										</Badge>
									</>
								))}
						</div>
						<div className="mb-8 w-full flex-start flex-col gap-2">
							<div className="flex-col gap-4">
								<h1>Title</h1>
								<Input
									value={postTitle}
									onChange={(e) => setPostTitle(e.target.value)}
									placeholder={cn(
										"Dear ",
										posterInfo?.userName,
										", what is the title of your topic?",
									)}
									className=" min-h-[10px] resize-none border-none p-0 focus-visible:ring-0"
								/>
							</div>
							<div className="my-4 flex-center gap-3">
								<Separator className="w-1/3" />
								<Sparkles color="#272727" size={15} />
								<Separator className="w-1/3" />
							</div>
							<div className="flex-col gap-4">
								<h1>Description</h1>
								<Textarea
									ref={textareaRef}
									value={postContent}
									onChange={handleInputChange}
									placeholder={cn("Describe your topic here")}
									className=" min-h-[10px] resize-none border-none p-0 focus-visible:ring-0"
								/>
							</div>
						</div>
					</div>

					{/* Mention suggestions */}
					{showMentionSuggestions && searchResults?.length > 0 && (
						<div className="mt-[20px] h-fit w-full flex-center">
							<SearchList
								searchResults={searchResults}
								appUserId={userId}
								isMention
								containerClassname="my-0 w-[90%] rounded-lg border-2 border-white"
								onSearchResultClick={handleSelectUser}
							/>
						</div>
					)}

					<DrawerFooter>
						<div className="flex-between">
							{/* Select post visibility */}
							<div className="h-[10px] w-[100px]" onClick={handleFakePost} />
							{/* <Select
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
							</Select> */}

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
