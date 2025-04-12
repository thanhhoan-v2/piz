"use client"
import { usePostCreation } from "@/context/PostCreationContext"
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
import { storageRemovePostMediaFiles } from "@utils/local-storage.helpers"
import { queryKey } from "@utils/queryKeyFactory"
import { generateBase64uuid } from "@utils/uuid.helpers"
import React, { useState } from "react"
import { toast } from "sonner"
import { getUserById } from "../../../app/actions/user"
import { PostFormContent } from "./PostFormContent"
import { PostFormFooter } from "./PostFormFooter"

// Define types for the query data structures
type PostsData = {
	posts: Post[]
	nextCursor?: string
	hasMore: boolean
}

type TeamPostsData = PostsData

export default function PostForm({
	children,
	teamId,
	onSuccess,
}: {
	children: React.ReactNode
	teamId?: string
	onSuccess?: () => void
}) {
	const [isDrawerOpen, setOpenDrawer] = React.useState<boolean>(false)
	const [postDiscardAlert, setAlertPostDiscard] = React.useState<boolean>(false)
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

	// Get post creation context
	const { addCreatingPost, removeCreatingPost } = usePostCreation()

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
		setIsAddingImage(false)
		setIsAddingVideo(false)
		setOpenDrawer(false)
		setPostContent("")
		setPostVisibility("PUBLIC")
		setSearchResults([])
		setMentionedUsers([])
		setShowMentionSuggestions(false)
		setStartMentionIndex(-1)
		setLastMentionIndexes([])

		// Clear media URLs and remove from local storage
		setPostVideoUrl(null)
		setPostImageUrl(null)
		storageRemovePostMediaFiles()
	}

	const hasUnsavedContent = () => {
		// Check if there's any content in the post or if user is adding a snippet, image, or video
		return (
			postContent.trim().length > 0 ||
			isAddingSnippet ||
			isAddingImage ||
			isAddingVideo ||
			(snippetCode && snippetCode.trim().length > 0) ||
			postImageUrl !== null ||
			postVideoUrl !== null
		)
	}

	const handleTouchOutsideModal = () => {
		// If there's any content, show the confirmation dialog
		if (hasUnsavedContent()) {
			setAlertPostDiscard(true)
		} else {
			// If no content, just close the drawer
			setOpenDrawer(false)
		}

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
			// Handle snippet creation first if needed
			if (isAddingSnippet == true && snippetId) {
				try {
					const newSnippet: CreateSnippetProps = {
						id: snippetId,
						userId: userId,
						value: snippetCode,
						lang: snippetLang,
						theme: "github-dark",
					}
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

			// If this is a team post, also cancel team posts queries
			if (teamId) {
				await queryClient.cancelQueries({ queryKey: queryKey.post.byTeam(teamId) })
			}

			// Snapshot the previous values
			const previousPosts = queryClient.getQueryData(queryKey.post.all) || []
			// Also snapshot team posts if this is a team post
			const previousTeamPosts = teamId
				? queryClient.getQueryData(queryKey.post.byTeam(teamId))
				: null

			// Create an optimistic post with all the necessary fields
			const optimisticPost = {
				...newPost,
				// Add any fields that might be expected by the UI but aren't in newPost
				updatedAt: new Date().toISOString(),
				isDeleted: false,
				_optimistic: true, // Mark as optimistic for potential special handling
			}

			// Update the global posts cache with optimistic data
			queryClient.setQueryData(
				[...queryKey.post.all, { limit: 5, cursor: undefined }],
				(old: PostsData | undefined) => {
					if (!old) return { posts: [optimisticPost], hasMore: false, nextCursor: undefined }
					return {
						...old,
						posts: [optimisticPost, ...(old.posts || [])],
					}
				},
			)

			// If this is a team post, also update the team posts cache
			if (teamId) {
				queryClient.setQueryData(
					[...queryKey.post.byTeam(teamId), { limit: 5, cursor: undefined }],
					(old: TeamPostsData | undefined) => {
						if (!old) return { posts: [optimisticPost], hasMore: false, nextCursor: undefined }
						return {
							...old,
							posts: [optimisticPost, ...(old.posts || [])],
						}
					},
				)
			}
			queryClient.setQueryData(queryKey.post.selectCount(newPost.id), {
				noReactions: 0,
				noShares: 0,
				noComments: 0,
			})
			queryClient.setQueryData(
				queryKey.post.selectReactionByUser({ userId, postId: newPost.id }),
				null,
			)

			// Return a context object with the snapshotted values
			return { previousPosts, previousTeamPosts }
		},
		onSuccess: (data) => {
			// Success toast is now handled in the handleSubmitPost function
			// No need to show a toast here

			// Immediately update the cache with the real data
			const realPost = data
			if (realPost) {
				// Update the main posts feed with the real post data
				queryClient.setQueryData(
					[...queryKey.post.all, { limit: 5, cursor: undefined }],
					(old: PostsData | undefined) => {
						if (!old || !old.posts) return old

						// Replace the optimistic post with the real one
						const updatedPosts = old.posts.map((post: Post) =>
							post.id === realPost.id ? { ...realPost } : post,
						)

						return {
							...old,
							posts: updatedPosts,
						}
					},
				)

				// Also update team posts if applicable
				if (teamId) {
					queryClient.setQueryData(
						[...queryKey.post.byTeam(teamId), { limit: 5, cursor: undefined }],
						(old: TeamPostsData | undefined) => {
							if (!old || !old.posts) return old

							// Replace the optimistic post with the real one
							const updatedPosts = old.posts.map((post: Post) =>
								post.id === realPost.id ? { ...realPost } : post,
							)

							return {
								...old,
								posts: updatedPosts,
							}
						},
					)
				}
			}

			// Clean up
			setOpenDrawer(false)
			setPostContent("")
			setPostVisibility("PUBLIC")
			setIsAddingSnippet(false)
			setIsAddingImage(false)
			setIsAddingVideo(false)

			setSnippetId(null)

			setPostVideoUrl(null)
			setPostImageUrl(null)
			storageRemovePostMediaFiles()

			// Call the onSuccess callback if provided
			if (onSuccess) {
				onSuccess()
			}

			// Remove from creating posts list after a short delay to ensure UI is updated
			if (realPost?.id) {
				setTimeout(() => {
					removeCreatingPost(realPost.id)
				}, 500)
			}
		},
		onError: (error, _newPost, context) => {
			console.error("Error creating post:", error)
			toast.error("Failed to create post. Please try again.")

			// Restore the previous states if available
			if (context) {
				// Restore global posts
				if (context.previousPosts) {
					queryClient.setQueryData(queryKey.post.all, context.previousPosts)
				}

				// Restore team posts if this was a team post
				if (teamId && context.previousTeamPosts) {
					queryClient.setQueryData(queryKey.post.byTeam(teamId), context.previousTeamPosts)
				}
			}

			// Re-open the drawer so the user can try again
			setOpenDrawer(true)
		},
	})

	// Local storage effect removed

	const handleSubmitPost = () => {
		if (!user?.id) {
			toast.error("You must be logged in to create a post")
			return
		}

		if (!postContent || postContent.trim() === "") {
			toast.error("Post content cannot be empty")
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
			teamId: teamId || null, // Add teamId if provided
		}

		// Show toast notification while creating the post
		// const toastId = toast.loading("Start to create your post...")

		// Add to creating posts list to show banner
		addCreatingPost(newPost.id)

		// Mutate and update toast based on result
		addPostMutation.mutate(newPost, {
			// onSuccess: () => {
			// 	// Dismiss the loading toast and show success message
			// 	const successMessage = teamId
			// 		? "Your team post has been created."
			// 		: "Your post has been created."
			// 	toast.success(successMessage, {
			// 		id: toastId, // Replace the loading toast with success
			// 	})

			// 	// We'll keep the banner until the post appears in the list
			// 	// The PostList component will handle removing it
			// },
			onError: () => {
				// Dismiss the loading toast
				// toast.dismiss(toastId)

				// Remove from creating posts list
				removeCreatingPost(newPost.id)
			},
		})
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
					className="dark:bg-background-item min-h-[90vh] max-h-[90vh]"
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
						handleSubmitPost={handleSubmitPost}
						handleFakePost={handleFakePost}
						isAddingImage={isAddingImage}
						isAddingVideo={isAddingVideo}
						isAddingSnippet={isAddingSnippet}
						isSnippetPreviewed={snippetPreview}
						setAlertSnippetDiscard={function (value: boolean): void {
							throw new Error("Function not implemented.")
						}}
					/>
				</DrawerContent>
			</Drawer>

			<PostFormAlerts
				postDiscardAlert={postDiscardAlert}
				setAlertPostDiscard={setAlertPostDiscard}
				setOpenDrawer={setOpenDrawer}
				handlePostDiscard={handlePostDiscard}
				hasContent={hasUnsavedContent()}
			/>
		</>
	)
}
