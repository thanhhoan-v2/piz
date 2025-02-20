"use client"

import { Badge } from "@components/ui/Badge"
import { Button } from "@components/ui/Button"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@components/ui/Select"
import { codeViewThemes } from "@components/ui/post-form/attachment/CodeViewThemes"
import { Editor } from "@monaco-editor/react"
import {
	STORAGE_KEY_SNIPPET_CODE,
	STORAGE_KEY_SNIPPET_ID,
	STORAGE_KEY_SNIPPET_LANG,
	STORAGE_KEY_SNIPPET_THEME,
	storageRemoveSnippet,
} from "@utils/local-storage.helpers"
import { firstLetterToUpper } from "@utils/string.helpers"
import { generateBase64uuid } from "@utils/uuid.helpers"
import { X } from "lucide-react"
import { useEffect, useState } from "react"
import SyntaxHighlighter from "react-syntax-highlighter"

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

	const defaultCodeEditorValue = "// Write your code here"

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
	useEffect(() => {
		const loadCodeViewStyle = async () => {
			try {
				const style = await import(
					`react-syntax-highlighter/dist/esm/styles/hljs/${snippetTheme}`
				).then((module) => module.default)
				setCodeViewStyle(style)
			} catch (error) {
				console.error("Error loading style:", error)
			}
		}

		loadCodeViewStyle()
	}, [snippetTheme])

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
				<div className="w-[80vw] flex-col gap-2">
					<div className="flex w-full items-center justify-between gap-2">
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

							<Select onValueChange={(e) => setSnippetTheme(e)}>
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
							</Select>
						</div>
					</div>

					<div>
						{codeViewStyle && (
							<SyntaxHighlighter showLineNumbers={true} language="javascript" style={codeViewStyle}>
								{code}
							</SyntaxHighlighter>
						)}
					</div>
				</div>
			) : (
				<div className="flex w-[600px] flex-col">
					<div className="">
						<div className="w-full max-w-[1000px] flex-col gap-2 rounded-lg border p-4">
							<div className="flex-between">
								<Select onValueChange={(e) => setSnippetLang(e)}>
									<SelectTrigger className="w-[130px] self-end">
										<SelectValue placeholder={snippetLang} />
									</SelectTrigger>
									<SelectContent>
										{SyntaxHighlighter.supportedLanguages.map((language: string) => (
											<SelectItem key={language} value={language}>
												{firstLetterToUpper(language)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								{code.length > 0 && <p className="text-red-400">Not saved</p>}

								<Button variant="ghost" onClick={handleDiscardSnippet}>
									<X />
								</Button>
							</div>

							<form onSubmit={() => setIsSaved(true)}>
								<div className="">
									<label htmlFor="comment" className="sr-only">
										Add your code
									</label>

									<Editor
										height="300px"
										width="500px"
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
											className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 font-semibold text-sm text-white hover:bg-indigo-500"
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
