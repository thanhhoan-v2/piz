"use client"

import { Button } from "@components/ui/Button"
import { Skeleton } from "@components/ui/Skeleton"
import { CodeBlock, CodeBlockCode, CodeBlockGroup } from "@components/ui/extras/code-block"
import { getSnippetById } from "@queries/server/snippet"
import { Check, Copy, Loader2, UserPlus, Share2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import VideoPlayer from "../post-form/attachment/VideoPlayer"
import { toast } from "sonner"
import { createSupabaseBrowserClient } from "@utils/supabase/client"

export type PostContentProps = {
	content: string
	postImageUrl: string | null
	postVideoUrl: string | null
	snippetId: string | null
	postId?: string
	userId?: string
}

export type SnippetViewProps = {
	value: string
	lang: string
}

export default function PostContent({
	content,
	postImageUrl,
	postVideoUrl,
	snippetId,
	postId,
	userId,
}: PostContentProps) {
	const router = useRouter()
	const [snippet, setSnippet] = useState<SnippetViewProps>()
	const [isSnippetLoading, setIsSnippetLoading] = useState(!!snippetId)
	const [isImageLoading, setIsImageLoading] = useState(!!postImageUrl)
	const [isVideoLoading, setIsVideoLoading] = useState(!!postVideoUrl)
	const [copied, setCopied] = useState(false)
	const [isCreatingRoom, setIsCreatingRoom] = useState(false)
	const supabase = createSupabaseBrowserClient()

	// Function to create a new collab room with the snippet code
	const createCollabRoom = async () => {
		if (!snippet?.value) return

		try {
			setIsCreatingRoom(true)

			// Use the API endpoint instead of direct Supabase call for better tracking
			const response = await fetch("/api/collab/create-room", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					content: snippet.value,
					userId: userId,
					sourceType: "post",
					sourceId: postId,
					snippetId: snippetId
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				console.error("Error creating collab room:", data)
				toast.error("Failed to create collaboration room")
				return
			}

			// Navigate to the new collab room
			const roomId = data.room.id
			toast.success("Collaboration room created! Redirecting...")

			// Give the toast time to show before redirecting
			setTimeout(() => {
				router.push(`/collab/${roomId}`)
			}, 1000)
		} catch (err) {
			console.error("Failed to create collab room:", err)
			toast.error("Something went wrong while creating the room")
		} finally {
			setIsCreatingRoom(false)
		}
	}

	const handleCopy = () => {
		if (snippet?.value) {
			navigator.clipboard.writeText(snippet.value)
		}
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	useEffect(() => {
		if (snippetId) {
			setIsSnippetLoading(true)
			clientGetSnippetById()
		}
	}, [snippetId])

	// Update image loading state when the image URL changes
	useEffect(() => {
		if (postImageUrl) {
			console.log("[POST] Setting up image loading for:", postImageUrl)
			setIsImageLoading(true)
		}
	}, [postImageUrl])

	// Update video loading state when the video URL changes
	useEffect(() => {
		if (postVideoUrl) {
			console.log("[POST] Setting up video loading for:", postVideoUrl)
			setIsVideoLoading(true)
		}
	}, [postVideoUrl])

	const clientGetSnippetById = async () => {
		if (!snippetId) {
			setIsSnippetLoading(false)
			return
		}

		try {
			console.log("[SNIPPET] Fetching snippet with ID:", snippetId)
			const data = await getSnippetById(snippetId)

			if (data?.value && data?.lang) {
				console.log("[SNIPPET] Successfully fetched snippet:", {
					id: snippetId,
					lang: data.lang,
					valueLength: data.value.length,
				})
				setSnippet({
					value: data.value,
					lang: data.lang,
				})
			} else {
				console.error("[SNIPPET] Snippet data is incomplete or missing:", data)
				setSnippet(undefined)
			}
		} catch (error) {
			console.error("[SNIPPET] Error fetching snippet:", error)
			setSnippet(undefined)
		} finally {
			setIsSnippetLoading(false)
		}
	}

	/*
	 ** Avoid click on not-content part of the post
	 */
	const handlePostClick = (event: React.MouseEvent<HTMLDivElement>) => {
		const targetTag = (event.target as HTMLElement).tagName.toLowerCase()
		console.log(targetTag)
		if (targetTag === "div" && userId && postId) {
			router.push(`/${userId}/post/${postId}`)
		}
	}

	const handlePostKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter" && userId && postId) {
			router.push(`/${userId}/post/${postId}`)
		}
	}

	return (
		<>
			<div className="flex flex-col gap-4" onClick={handlePostClick} onKeyUp={handlePostKeyUp}>
				<div>
					<p className="text-white whitespace-pre-line">{content}</p>

					<div className="my-2" />

					{/* Post image with skeleton */}
					{postImageUrl && (
						<div className="relative">
							{isImageLoading && (
								<div className="flex-center">
									<Skeleton className="rounded-lg w-[300px] h-[300px]" />
								</div>
							)}
							<div className="flex-center" style={{ display: isImageLoading ? "none" : "flex" }}>
								<Image
									className="rounded-lg"
									width={300}
									height={300}
									src={postImageUrl}
									alt="Uploaded Image"
									priority
									onLoad={() => {
										console.log("[POST] Image loaded in post content")
										setIsImageLoading(false)
									}}
									onError={() => {
										console.error("[POST] Error loading image in post content")
										setIsImageLoading(false)
									}}
								/>
							</div>
						</div>
					)}

					{/* Post video with skeleton */}
					{postVideoUrl && (
						<div className="relative">
							{isVideoLoading && (
								<div className="flex justify-center items-center bg-muted rounded-lg w-full h-[300px]">
									<Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
								</div>
							)}
							<div style={{ display: isVideoLoading ? "none" : "block" }}>
								<VideoPlayer
									src={postVideoUrl}
									onLoaded={() => {
										console.log("[POST] Video loaded in post content")
										setIsVideoLoading(false)
									}}
								/>
							</div>
						</div>
					)}

					{/* Code snippet with skeleton */}
					{snippetId && (
						<div className="w-full">
							{isSnippetLoading ? (
								<div className="space-y-2">
									<Skeleton className="rounded-b-none w-full h-10" />
									<Skeleton className="rounded-t-none w-full h-[200px]" />
								</div>
							) : snippet?.value && snippet?.lang ? (
								<CodeBlock>
									<CodeBlockGroup className="px-4 py-2 border-b border-border">
										<div className="flex items-center gap-2">
											<div className="bg-primary/10 px-2 py-1 rounded font-medium text-primary text-xs">
												{snippet.lang}
											</div>
										</div>
										<div className="flex gap-1">
											<Button
												variant="ghost"
												size="icon"
												className="w-8 h-8"
												onClick={handleCopy}
												title="Copy code"
											>
												{copied ? (
													<Check className="w-4 h-4 text-green-500" />
												) : (
													<Copy className="w-4 h-4" />
												)}
											</Button>
											<Button
												variant="secondary"
												size="sm"
												className="text-xs flex gap-1 items-center px-2 bg-blue-600/30 text-blue-300 hover:bg-blue-600/40 border border-blue-600/40"
												onClick={createCollabRoom}
												disabled={isCreatingRoom}
												title="Create a collaborative editing room with this code"
											>
												{isCreatingRoom ? (
													<>
														<Loader2 className="w-3 h-3 animate-spin" />
														<span>Creating...</span>
													</>
												) : (
													<>
														<UserPlus className="w-3 h-3" />
														<span>Edit in collaboration room</span>
													</>
												)}
											</Button>
										</div>
									</CodeBlockGroup>
									<CodeBlockCode code={snippet.value} language={snippet.lang} theme="github-dark" />
								</CodeBlock>
							) : (
								<div className="bg-red-50 p-4 border border-red-300 rounded-md text-red-800">
									Failed to load code snippet
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</>
	)
}
