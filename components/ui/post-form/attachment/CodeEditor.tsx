"use client"

import { Button } from "@components/ui/Button"
// Dialog imports removed
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@components/ui/Select"
import { CodeBlock, CodeBlockCode } from "@components/ui/extras/code-block"
import { Editor } from "@monaco-editor/react"
import { Braces, Check, Code, FileCode, PenIcon, Terminal, X } from "lucide-react"
import { useEffect, useState } from "react"

export type CodeEditorProps = {
	setIsAddingSnippetAction: (isAddingSnippet: boolean) => void
	onSnippetRemoveAction: () => void
	onSnippetCodeChangeAction: (code: string) => void
	onSnippetLangChangeAction: (lang: string) => void
	onSnippetPreviewAction: (isSnippetPreviewed: boolean) => void
}

const PROGRAMMING_LANGUAGES = [
	"javascript",
	"typescript",
	"python",
	"java",
	"c",
	"cpp",
	"csharp",
	"go",
	"rust",
	"ruby",
	"php",
	"swift",
	"kotlin",
	"html",
	"css",
	"sql",
	"shell",
	"json",
	"yaml",
	"markdown",
	"plaintext",
]

const firstLetterToUpper = (str: string) => {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

// Helper function to get language icon
const getLanguageIcon = (language: string) => {
	switch (language) {
		case "javascript":
		case "typescript":
			return <Braces className="w-4 h-4 text-yellow-500" />
		case "python":
			return <Code className="w-4 h-4 text-blue-500" />
		case "java":
		case "kotlin":
			return <FileCode className="w-4 h-4 text-orange-500" />
		case "c":
		case "cpp":
		case "csharp":
			return <FileCode className="w-4 h-4 text-purple-500" />
		case "shell":
			return <Terminal className="w-4 h-4 text-green-500" />
		default:
			return <Code className="w-4 h-4 text-gray-500" />
	}
}

export default function CodeEditor({
	setIsAddingSnippetAction,
	onSnippetRemoveAction,
	onSnippetCodeChangeAction,
	onSnippetLangChangeAction,
	onSnippetPreviewAction,
}: CodeEditorProps) {
	const [code, setCode] = useState<string>("")
	const [snippetLang, setSnippetLang] = useState<string>("javascript")
	const [isSaved, setIsSaved] = useState<boolean>(false)

	// Confirmation dialog state removed - now handled in PostForm

	const defaultCodeEditorValue = ""

	const handlePreviewSnippet = () => {
		// Save the snippet and mark it as previewed
		setIsSaved(true)
		onSnippetPreviewAction(true)
		console.log("[SNIPPET] Snippet saved and previewed")
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (code.length > 0) {
			onSnippetCodeChangeAction(code)
		} else if (code.length === 0) {
			onSnippetCodeChangeAction("")
		}
	}, [code])

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		onSnippetLangChangeAction(snippetLang)
	}, [snippetLang])

	// Simplified discard function - confirmation now handled in PostForm
	const handleDiscardSnippet = () => {
		setCode("")
		setSnippetLang("javascript")
		setIsAddingSnippetAction(false)
		onSnippetRemoveAction()
		onSnippetPreviewAction(false)
	}

	return (
		<>
			{/* Confirmation Dialog removed - now handled in PostForm */}

			{isSaved ? (
				<div className="flex flex-col w-[82vw]">
					<div className="flex-col gap-4 bg-background-item/30 shadow-sm p-6 border border-border rounded-lg w-full">
						{/* Header with gradient background */}
						<div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
							<div className="flex items-center gap-2">
								<div className="bg-primary/10 p-2 rounded-md">
									<FileCode className="w-5 h-5 text-primary" />
								</div>
								<h3 className="font-semibold text-lg">Code Preview</h3>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="hover:bg-destructive/10 rounded-full hover:text-destructive"
								onClick={handleDiscardSnippet}
							>
								<X className="w-5 h-5" />
							</Button>
						</div>

						{/* Language badge */}
						<div className="flex items-center gap-2 mb-4">
							<div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full font-medium text-sm">
								{getLanguageIcon(snippetLang)}
								<span>{firstLetterToUpper(snippetLang)}</span>
							</div>
						</div>

						{/* Code preview with enhanced styling */}
						<div className="border border-border rounded-md overflow-hidden">
							<CodeBlock>
								<CodeBlockCode code={code} language={snippetLang} theme="github-dark" />
							</CodeBlock>
						</div>

						{/* Footer with info */}
						<div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
							<div className="flex items-center gap-2 text-muted-foreground text-xs">
								<span>{code.length} characters</span>
								<span>•</span>
								<span>Ready to post</span>
							</div>
							<Button
								variant="outline"
								size="sm"
								className="hover:bg-primary/10 border-primary/20 text-primary"
								onClick={() => {
									setIsSaved(false)
									onSnippetPreviewAction(false)
								}}
							>
								<PenIcon className="mr-1 w-4 h-4" />
								Edit Code
							</Button>
						</div>
					</div>
				</div>
			) : (
				<div className="flex flex-col w-[90vw]">
					<div className="">
						<div className="flex-col gap-4 bg-background-item/30 shadow-sm p-6 border border-border rounded-lg w-full">
							{/* Header with gradient background */}
							<div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
								<div className="flex items-center gap-2">
									<div className="bg-primary/10 p-2 rounded-md">
										<Code className="w-5 h-5 text-primary" />
									</div>
									<h3 className="font-semibold text-lg">Code Snippet</h3>
								</div>
								<Button
									variant="ghost"
									size="icon"
									className="hover:bg-destructive/10 rounded-full hover:text-destructive"
									onClick={handleDiscardSnippet}
								>
									<X className="w-5 h-5" />
								</Button>
							</div>

							{/* Language selector with icon */}
							<div className="flex justify-between items-center mb-4">
								<div className="flex items-center gap-2">
									<Select onValueChange={(e) => setSnippetLang(e)}>
										<SelectTrigger className="bg-primary/5 border-primary/20 w-[180px]">
											<div className="flex items-center gap-2">
												{getLanguageIcon(snippetLang)}
												<SelectValue placeholder={firstLetterToUpper(snippetLang)} />
											</div>
										</SelectTrigger>
										<SelectContent>
											{PROGRAMMING_LANGUAGES.map((language: string) => (
												<SelectItem key={language} value={language}>
													<div className="flex items-center gap-2">
														{getLanguageIcon(language)}
														{firstLetterToUpper(language)}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								{code.length > 0 && (
									<div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-md font-medium text-amber-500 text-xs">
										<div className="bg-amber-500 rounded-full w-2 h-2 animate-pulse" />
										Unsaved changes
									</div>
								)}
							</div>

							<form
								className="w-full"
								onSubmit={(e) => {
									e.preventDefault()
									setIsSaved(true)
									onSnippetPreviewAction(true)
								}}
							>
								<div className="">
									<label htmlFor="comment" className="sr-only">
										Add your code
									</label>

									<div className="border border-border rounded-md overflow-hidden">
										<Editor
											height="300px"
											width="100%"
											value={code || ""}
											onChange={(value) => setCode(value || "")}
											theme="vs-dark"
											language={snippetLang}
											options={{
												minimap: {
													enabled: false,
												},
												fontSize: 16,
												fontFamily: "Fira Code",
												guides: {
													indentation: true,
													bracketPairs: true,
													bracketPairsHorizontal: true,
													highlightActiveBracketPair: true,
													highlightActiveIndentation: true,
												},
												renderLineHighlight: "all",
												lineNumbers: "on",
												lineDecorationsWidth: 10,
												lineNumbersMinChars: 3,
												scrollBeyondLastLine: false,
												cursorBlinking: "smooth",
												cursorSmoothCaretAnimation: "on",
												roundedSelection: true,
											}}
											className="font-mono"
											defaultValue={defaultCodeEditorValue}
										/>
									</div>
								</div>
								{/* Footer with action buttons */}
								<div className="flex justify-between items-center mt-2 pt-4 border-t border-border">
									<div className="flex items-center gap-2 text-muted-foreground text-xs">
										<div className="flex items-center gap-1 bg-primary/5 px-2 py-1 rounded">
											{getLanguageIcon(snippetLang)}
											<span>{firstLetterToUpper(snippetLang)}</span>
										</div>
										<span>•</span>
										<span>{code.length} characters</span>
									</div>
									<div className="flex items-center gap-2">
										<Button
											variant="secondary"
											size="sm"
											onClick={handleDiscardSnippet}
											className="hover:bg-destructive/10 border-destructive/30 text-destructive"
										>
											<X className="mr-1 w-4 h-4" />
											Discard
										</Button>
										<Button
											variant="default"
											size="sm"
											onClick={handlePreviewSnippet}
											className="bg-primary hover:bg-primary/90"
										>
											<Check className="mr-1 w-4 h-4" />
											Save Snippet
										</Button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
