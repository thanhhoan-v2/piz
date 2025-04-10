"use client"

import { Badge } from "@components/ui/Badge"
import { Button } from "@components/ui/Button"
import { Select, SelectContent, SelectTrigger, SelectValue } from "@components/ui/Select"
import { CodeBlock, CodeBlockCode, CodeBlockGroup } from "@components/ui/extras/code-block"
import { Editor } from "@monaco-editor/react"
import {
	STORAGE_KEY_SNIPPET_CODE,
	STORAGE_KEY_SNIPPET_ID,
	STORAGE_KEY_SNIPPET_LANG,
	STORAGE_KEY_SNIPPET_THEME,
	storageRemoveSnippet,
} from "@utils/local-storage.helpers"
import { generateBase64uuid } from "@utils/uuid.helpers"
import { X } from "lucide-react"
import { useEffect, useState } from "react"
// import SyntaxHighlighter from "react-syntax-highlighter"

export type CodeEditorProps = {
	setIsAddingSnippetAction: (isAddingSnippet: boolean) => void
	onSnippetRemoveAction: () => void
	onSnippetCodeChangeAction: (code: string) => void
	onSnippetLangChangeAction: (lang: string) => void
	onSnippetThemeChangeAction: (theme: string) => void
	onSnippetPreviewAction: (isSnippetPreviewed: boolean) => void
}

export default function CodeEditor({
	setIsAddingSnippetAction,
	onSnippetRemoveAction,
	onSnippetCodeChangeAction,
	onSnippetLangChangeAction,
	onSnippetThemeChangeAction,
	onSnippetPreviewAction,
}: CodeEditorProps) {
	const [code, setCode] = useState<string>(() => {
		const storedCode = localStorage.getItem(STORAGE_KEY_SNIPPET_CODE)
		return storedCode || ""
	})

	const [snippetLang, setSnippetLang] = useState<string>(() => {
		const storedEditorLanguage = localStorage.getItem(STORAGE_KEY_SNIPPET_LANG)
		return storedEditorLanguage || "javascript"
	})

	const [snippetTheme, setSnippetTheme] = useState<string>(() => {
		const storedEditorTheme = localStorage.getItem(STORAGE_KEY_SNIPPET_THEME)
		return storedEditorTheme || "dark"
	})

	const [isSaved, setIsSaved] = useState<boolean>(false)

	const [codeViewStyle, setCodeViewStyle] = useState(null)

	// Code review functionality has been removed
	const defaultCodeEditorValue = ""

	const handlePreviewSnippet = () => {
		onSnippetPreviewAction(true)
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (code.length > 0) {
			const newSnippetId = generateBase64uuid()
			localStorage.setItem(STORAGE_KEY_SNIPPET_ID, newSnippetId)

			localStorage.setItem(STORAGE_KEY_SNIPPET_CODE, code)
			onSnippetCodeChangeAction(code)
		} else if (code.length === 0) {
			localStorage.removeItem(STORAGE_KEY_SNIPPET_CODE)
			onSnippetCodeChangeAction("")
		}
	}, [code])

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY_SNIPPET_LANG, snippetLang)
		onSnippetLangChangeAction(snippetLang)
		localStorage.setItem(STORAGE_KEY_SNIPPET_THEME, snippetTheme)
		onSnippetThemeChangeAction(snippetTheme)
	}, [snippetLang, snippetTheme])

	// Dynamically import react-syntax-highlighter's style
	// useEffect(() => {
	// 	const loadCodeViewStyle = async () => {
	// 		try {
	// 			const style = await import(
	// 				`react-syntax-highlighter/dist/esm/styles/hljs/${snippetTheme}`
	// 			).then((module) => module.default)
	// 			setCodeViewStyle(style)
	// 		} catch (error) {
	// 			console.error("Error loading style:", error)
	// 		}
	// 	}

	// 	loadCodeViewStyle()
	// }, [snippetTheme])

	const handleDiscardSnippet = () => {
		setCode("")
		setSnippetLang("javascript")
		setIsAddingSnippetAction(false)
		onSnippetRemoveAction()
		onSnippetPreviewAction(false)

		storageRemoveSnippet()
	}

	return (
		<>
			{isSaved ? (
				<div className="flex-col gap-2 min-w-[80vw]">
					<div className="flex justify-between items-center gap-2 w-full">
						<div>
							<Badge className="italic">{snippetLang}</Badge>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								className="p-5"
								onClick={() => {
									setIsSaved(false)
									onSnippetPreviewAction(false)
								}}
							>
								Edit
							</Button>

							{/* <Select onValueChange={(e) => setSnippetTheme(e)}>
								<SelectTrigger className="w-[200px]">
									<SelectValue placeholder={snippetTheme} />
								</SelectTrigger>
								<SelectContent>
									{codeViewThemes.map((theme) => (
										<SelectItem key={theme} value={theme}>
											{firstLetterToUpper(theme)}
										</SelectItem>
									))}
								</SelectContent>
							</Select> */}
						</div>
					</div>

					<div>
						{codeViewStyle && (
							<CodeBlock>
								<CodeBlockGroup className="px-4 py-2 border-b border-border">
									<div className="flex items-center gap-2">
										<div className="bg-primary/10 px-2 py-1 rounded font-medium text-primary text-xs">
											{snippetLang}
										</div>
										{/* <span className="text-muted-foreground text-sm">GitHub Dark Theme</span> */}
									</div>
								</CodeBlockGroup>
								<CodeBlockCode code={code} language={snippetLang} theme={snippetTheme} />
							</CodeBlock>
						)}
					</div>
				</div>
			) : (
				<div className="flex flex-col w-[82vw]">
					<div className="">
						<div className="flex-col gap-2 p-4 border rounded-lg w-full">
							<div className="flex-between">
								<Select onValueChange={(e) => setSnippetLang(e)}>
									<SelectTrigger className="self-end w-[130px]">
										<SelectValue placeholder={snippetLang} />
									</SelectTrigger>
									<SelectContent>
										{/* {SyntaxHighlighter.supportedLanguages.map((language: string) => (
											<SelectItem key={language} value={language}>
												{firstLetterToUpper(language)}
											</SelectItem>
										))} */}
									</SelectContent>
								</Select>

								{code.length > 0 && <p className="text-red-400">Not saved</p>}

								<Button variant="ghost" onClick={handleDiscardSnippet}>
									<X />
								</Button>
							</div>

							<form className="w-full" onSubmit={() => setIsSaved(true)}>
								<div className="">
									<label htmlFor="comment" className="sr-only">
										Add your code
									</label>

									<Editor
										height="300px"
										width="80vw"
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
										}}
										className="bg-black-50 font-mono text-[2.1rem] text-white leading-6"
										defaultValue={defaultCodeEditorValue}
									/>
								</div>
								<div className="flex justify-between pt-2">
									<div className="flex items-center space-x-5" />
									<div className="flex-shrink-0">
										<Button
											onClick={handlePreviewSnippet}
											className="inline-flex items-center bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded-md font-semibold text-white text-sm"
										>
											Save
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
