"use client"

import { Button } from "@components/ui/Button"
import { CodeBlock, CodeBlockCode, CodeBlockGroup } from "@components/ui/extras/code-block"
import { getSnippetById } from "@queries/server/snippet"
import { Check, Copy } from "lucide-react"
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
	const [snippetThemeImport, setSnippetThemeImport] = useState()

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
			clientGetSnippetById()
		}
	}, [])

	const clientGetSnippetById = async () => {
		const data = await getSnippetById(snippetId)
		if (data)
			setSnippet({
				value: data.value,
				theme: data.theme,
				lang: data.lang,
			})
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

	// useEffect(() => {
	// 	const loadCodeViewStyle = async () => {
	// 		try {
	// 			const style = await import(
	// 				`react-syntax-highlighter/dist/esm/styles/hljs/${snippet?.theme ?? "dark"}`
	// 			).then((module) => module.default)
	// 			setSnippetThemeImport(style)
	// 		} catch (error) {
	// 			console.error("Error loading style:", error)
	// 		}
	// 	}

	// 	loadCodeViewStyle()
	// }, [snippet])

	return (
		<>
			<div
				className="flex flex-col gap-4"
				onClick={handlePostClick}
				onKeyUp={handlePostKeyUp}
				tabIndex={0}
				role="button"
			>
				<div>
					<p className="text-white">{content}</p>

					<div className="my-2" />

					{postImageUrl && (
						<Suspense fallback={<p>Loading...</p>}>
							<div className="flex-center">
								<Image
									className="rounded-lg"
									width={300}
									height={300}
									src={postImageUrl}
									alt="Uploaded Image"
								/>
							</div>
						</Suspense>
					)}

					{postVideoUrl && (
						<Suspense fallback={<p>Loading...</p>}>
							<VideoPlayer src={postVideoUrl} />
						</Suspense>
					)}

					{snippetId && snippet && snippet?.value && snippet?.lang && (
						<>
							<div className="w-full">
								<CodeBlock>
									<CodeBlockGroup className="px-4 py-2 border-b border-border">
										<div className="flex items-center gap-2">
											<div className="bg-primary/10 px-2 py-1 rounded font-medium text-primary text-xs">
												JavaScript
											</div>
											{/* <span className="text-muted-foreground text-sm">GitHub Dark Theme</span> */}
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
							</div>
							{/* <SyntaxHighlighter */}
							{/* 	showLineNumbers={true} */}
							{/* 	language="javascript" */}
							{/* 	style={snippetThemeImport} */}
							{/* > */}
							{/* 	{snippet?.value} */}
							{/* </SyntaxHighlighter> */}
							{/* {getCodeReview(snippet?.value, snippet?.lang)} */}
						</>
					)}
				</div>
			</div>
		</>
	)
}
