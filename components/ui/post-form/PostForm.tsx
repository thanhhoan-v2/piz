"use client"
import {
	type IMentionedResult,
	PostVisibilityEnumArray,
	type PostVisibilityEnumType,
} from "@/types/post.types"
import { Drawer, DrawerContent, DrawerTrigger } from "@components/ui/Drawer"
import WelcomeModal from "@components/ui/modal/WelcomeModal"
import { PostFormAlerts } from "@components/ui/post-form/PostFormAlerts"
import { PostFormHeader } from "@components/ui/post-form/PostFormHeader"
import type { SearchResultProps } from "@components/ui/search/SearchList"
import { faker } from "@faker-js/faker"
import type { Post } from "@prisma/client"
import { type CreatePostProps, createPost } from "@queries/server/post"
import { type CreateSnippetProps, createSnippet } from "@queries/server/snippet"
import { useUser } from "@stackframe/stack"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
	STORAGE_KEY_SNIPPET_ID,
	storageRemovePostMediaFiles,
	storageRemoveSnippet,
} from "@utils/local-storage.helpers"
import { queryKey } from "@utils/queryKeyFactory"
import { generateBase64uuid } from "@utils/uuid.helpers"
import React, { useState } from "react"
import { toast } from "sonner"
import { getUserById } from "../../../app/actions/user"
import { PostFormContent } from "./PostFormContent"
import { PostFormFooter } from "./PostFormFooter"

export default function PostForm({ children }: { children: React.ReactNode }) {
	const [isDrawerOpen, setOpenDrawer] = React.useState<boolean>(false)
	const [postDiscardAlert, setAlertPostDiscard] = React.useState<boolean>(false)
	const [snippetDiscardAlert, setAlertSnippetDiscard] = React.useState<boolean>(false)
	const [postContent, setPostContent] = React.useState("")
	const [postVisibility, setPostVisibility] = React.useState<PostVisibilityEnumType>("PUBLIC")

	const textareaRef = React.useRef<HTMLTextAreaElement>(null)

	const [showMentionSuggestions, setShowMentionSuggestions] = React.useState<boolean>(false)
	const [startMentionIndex, setStartMentionIndex] = React.useState<number>(-1)
	const [lastMentionIndexes, setLastMentionIndexes] = React.useState<number[]>([])
	const [mentionSearchValue, setMentionSearchValue] = React.useState<string>("")
	const [mentionedUsers, setMentionedUsers] = React.useState<IMentionedResult[]>([])
	const [searchResults, setSearchResults] = React.useState<SearchResultProps>([])
	const [posterInfo, setPosterInfo] = React.useState<{
		userName: string
		userAvatarUrl: string
		userId: string
	}>()

	const [isAddingSnippet, setIsAddingSnippet] = React.useState<boolean>(false)
	const [isAddingVideo, setIsAddingVideo] = React.useState<boolean>(false)
	const [isAddingImage, setIsAddingImage] = React.useState<boolean>(false)

	const [postImageUrl, setPostImageUrl] = React.useState<string | null>(null)
	const [postVideoUrl, setPostVideoUrl] = React.useState<string | null>(null)
	const [snippetId, setSnippetId] = React.useState<string | null>(null)
	const [snippetCode, setSnippetCode] = useState<string>("")
	const [snippetLang, setSnippetLang] = useState<string>("javascript")
	const [snippetTheme, setSnippetTheme] = useState<string>("dark")
	const [snippetPreview, setSnippetPreview] = useState<boolean>(false)

	const user = useUser()
	const userId = user?.id

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
			if (newValue.length > lastMentionIndex && !substringFromLastMentionIndex.includes(" ")) {
				setMentionSearchValue(substringFromLastMentionIndex)
				setShowMentionSuggestions(true)
			}

			if (postContent.length < lastMentionIndexes[lastMentionIndexes.length - 1] + 2) {
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

	const handlePostDiscard = () => {
		setIsAddingSnippet(false)
		setOpenDrawer(false)
		setPostContent("")
		setPostVisibility("PUBLIC")
		setSearchResults([])
		setMentionedUsers([])
		setShowMentionSuggestions(false)
		setStartMentionIndex(-1)
		setLastMentionIndexes([])
	}

	const handleTouchOutsideModal = () => {
		if (postContent.length > 0) setAlertPostDiscard(true)
		if (isAddingSnippet) setAlertSnippetDiscard(true)

		setSearchResults([])
		setMentionedUsers([])
		setShowMentionSuggestions(false)
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

	const addPostMutation = useMutation({
		mutationKey: queryKey.post.insert(),
		mutationFn: async (newPost: CreatePostProps) => {
			console.log(snippetId, isAddingSnippet)

			// Handle snippet creation first if needed
			if (isAddingSnippet == true && snippetId) {
				try {
					const newSnippet: CreateSnippetProps = {
						id: snippetId,
						userId: userId,
						value: snippetCode,
						lang: snippetLang,
						theme: snippetTheme,
					}
					console.log(newSnippet)
					await createSnippet(newSnippet)
				} catch (error) {
					throw new Error("Failed to save code snippet")
				}
			}
			// Then create the post
			return await createPost(newPost)
		},
		onMutate: async (newPost) => {
			// Cancel any outgoing refetches to not overwrite our optimistic updates
			await queryClient.cancelQueries({ queryKey: queryKey.post.all })

			// Snapshot the previous value
			const previousPosts = queryClient.getQueryData(queryKey.post.all)

			queryClient.setQueryData(queryKey.post.all, (old: Post[]) => [newPost, ...old])
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
			toast("Your post has been created.")

			// Clean up
			setOpenDrawer(false)
			setPostContent("")
			setPostVisibility("PUBLIC")
			setIsAddingSnippet(false)
			setIsAddingImage(false)
			setIsAddingVideo(false)

			setSnippetId(null)
			storageRemoveSnippet()

			setPostVideoUrl(null)
			setPostImageUrl(null)
			storageRemovePostMediaFiles()
		},
		onError: (error) => {
			toast("Failed to create post. Please try again.")
		},
	})

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	React.useEffect(() => {
		const storedSnippetId = localStorage.getItem(STORAGE_KEY_SNIPPET_ID)
		if (storedSnippetId) {
			setSnippetId(storedSnippetId)
		}
	}, [snippetCode])

	const handleSubmitPost = () => {
		if (!user?.id) {
			toast("You must be logged in to create a post")
			return
		}

		setOpenDrawer(false)

		const date = new Date()
		const newPost: CreatePostProps = {
			id: generateBase64uuid(),
			userId: user.id,
			userName: user.displayName,
			userAvatarUrl: user.profileImageUrl || null,
			createdAt: date,
			content: postContent,
			postImageUrl: postImageUrl,
			postVideoUrl: postVideoUrl,
			snippetId: snippetId,
		}

		addPostMutation.mutate(newPost)
	}

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
					className="max-h-[90vh] min-h-[90vh] dark:bg-background-item"
					onPointerDownOutside={handleTouchOutsideModal}
				>
					<PostFormHeader />
					<PostFormContent
						mentionedUsers={mentionedUsers}
						postContent={postContent}
						textareaRef={textareaRef}
						handleInputChange={handleInputChange}
						showMentionSuggestions={showMentionSuggestions}
						searchResults={searchResults}
						userId={userId}
						handleSelectUser={handleSelectUser}
						// Snippet's
						isAddingSnippet={isAddingSnippet}
						setIsAddingSnippet={setIsAddingSnippet}
						onSnippetUpload={(id) => setSnippetId(id)}
						onSnippetCodeChange={(code) => setSnippetCode(code)}
						onSnippetLangChange={(lang) => setSnippetLang(lang)}
						onSnippetThemeChange={(theme) => setSnippetTheme(theme)}
						onSnippetPreview={(isSnippetPreviewed) => setSnippetPreview(isSnippetPreviewed)}
						onSnippetRemove={() => {
							setSnippetId(null)
							setSnippetPreview(false)
						}}
						// Video's
						isAddingVideo={isAddingVideo}
						setIsAddingVideo={setIsAddingVideo}
						onVideoRemove={() => setPostVideoUrl(null)}
						onVideoUpload={(url) => setPostVideoUrl(url)}
						// Image's
						isAddingImage={isAddingImage}
						setIsAddingImage={setIsAddingImage}
						onImageRemove={() => setPostImageUrl(null)}
						onImageUpload={(url) => setPostImageUrl(url)}
					/>
					<PostFormFooter
						setPostVisibility={setPostVisibility}
						setIsAddingImage={setIsAddingImage}
						setIsAddingVideo={setIsAddingVideo}
						setIsAddingSnippet={setIsAddingSnippet}
						setAlertSnippetDiscard={setAlertSnippetDiscard}
						handleSubmitPost={handleSubmitPost}
						handleFakePost={handleFakePost}
						isAddingImage={isAddingImage}
						isAddingVideo={isAddingVideo}
						isAddingSnippet={isAddingSnippet}
						isSnippetPreviewed={snippetPreview}
					/>
				</DrawerContent>
			</Drawer>

			<PostFormAlerts
				postDiscardAlert={postDiscardAlert}
				setAlertPostDiscard={setAlertPostDiscard}
				setOpenDrawer={setOpenDrawer}
				handlePostDiscard={handlePostDiscard}
			/>
		</>
	)
}
