"use client"

import { getSnippetById } from "@queries/server/snippet"
import Image from "next/image"
import { Suspense, useEffect, useState } from "react"
import SyntaxHighlighter from "react-syntax-highlighter"
import VideoPlayer from "../post-form/attachment/VideoPlayer"

export type PostContentProps = {
	content: string
	postImageUrl: string | null
	postVideoUrl: string | null
	snippetId: string | null
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
}: PostContentProps) {
	const [snippet, setSnippet] = useState<SnippetViewProps>()
	const [snippetThemeImport, setSnippetThemeImport] = useState()

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

	useEffect(() => {
		const loadCodeViewStyle = async () => {
			try {
				const style = await import(
					`react-syntax-highlighter/dist/esm/styles/hljs/${snippet?.theme ?? "dark"}`
				).then((module) => module.default)
				setSnippetThemeImport(style)
			} catch (error) {
				console.error("Error loading style:", error)
			}
		}

		loadCodeViewStyle()
	}, [snippet])

	return (
		<>
			<div className="flex flex-col gap-4">
				<div className="text-wrap-pretty">
					<p>{content}</p>
					{postImageUrl && (
						<Suspense fallback={<p>Loading...</p>}>
							<Image width={300} height={300} src={postImageUrl} alt="Uploaded Image" />
						</Suspense>
					)}

					{postVideoUrl && (
						<Suspense fallback={<p>Loading...</p>}>
							<VideoPlayer src={postVideoUrl} />
						</Suspense>
					)}

					{snippetId && snippet && snippet?.value && (
						<SyntaxHighlighter
							showLineNumbers={true}
							language="javascript"
							style={snippetThemeImport}
						>
							{snippet?.value}
						</SyntaxHighlighter>
					)}
				</div>
			</div>
		</>
	)
}
