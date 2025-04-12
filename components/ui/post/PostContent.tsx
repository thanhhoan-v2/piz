"use client"

import { Button } from "@components/ui/Button"
import { CodeBlock, CodeBlockCode, CodeBlockGroup } from "@components/ui/extras/code-block"
import { Skeleton } from "@components/ui/Skeleton"
import { getSnippetById } from "@queries/server/snippet"
import { Check, Copy, Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import VideoPlayer from "../post-form/attachment/VideoPlayer"

export type PostContentProps = {
	content: string
	postImageUrl: string | null
	postVideoUrl: string | null
	snippetId: string | null
	postId?: string
	userId?: string
}
export type SnippetViewProps = {
	value?: string | null
	theme?: string | null
	lang?: string | null
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

	const handleCopy = () => {
		if (snippet?.value) {
			navigator.clipboard.writeText(snippet.value)
		}
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (snippetId) {
			setIsSnippetLoading(true)
			clientGetSnippetById()
		}
	}, [])

	const clientGetSnippetById = async () => {
		try {
			const data = await getSnippetById(snippetId)
			if (data)
				setSnippet({
					value: data.value,
					theme: data.theme,
					lang: data.lang,
				})
		} catch (error) {
			console.error("Error fetching snippet:", error)
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
					<p className="text-white">{content}</p>

					<div className="my-2" />

					{/* Post image with skeleton */}
					{postImageUrl && (
						<div className="relative">
							{isImageLoading && (
								<div className="flex-center">
									<Skeleton className="rounded-lg w-[300px] h-[300px]" />
								</div>
							)}
							<div className="flex-center" style={{ display: isImageLoading ? 'none' : 'flex' }}>
								<Image
									className="rounded-lg"
									width={300}
									height={300}
									src={postImageUrl}
									alt="Uploaded Image"
									onLoad={() => setIsImageLoading(false)}
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
							<div style={{ display: isVideoLoading ? 'none' : 'block' }}>
								<VideoPlayer 
									src={postVideoUrl} 
									onLoadedData={() => setIsVideoLoading(false)}
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
										<Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleCopy}>
											{copied ? (
												<Check className="w-4 h-4 text-green-500" />
											) : (
												<Copy className="w-4 h-4" />
											)}
										</Button>
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
