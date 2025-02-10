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
import { codeViewThemes } from "@components/ui/form/CodeViewThemes"
import { Editor } from "@monaco-editor/react"
import { type CreateSnippetProps, createSnippet } from "@queries/server/snippet"
import { useUser } from "@stackframe/stack"
import { firstLetterToUpper } from "@utils/string.helpers"
import { generateBase64uuid } from "@utils/uuid.helpers"
import { X } from "lucide-react"
import type { FormEvent } from "react"
import { useEffect, useState } from "react"
import SyntaxHighlighter from "react-syntax-highlighter"

export default function CodeEditor({
	setIsAddingSnippet,
}: { setIsAddingSnippet: (isAddingSnippet: boolean) => void }) {
	const [code, setCode] = useState<string>(() => {
		const storedCode = localStorage.getItem("code")
		return storedCode ? storedCode : ""
	})
	const [snippetId, setSnippetId] = useState<string>("")
	const [editorLanguage, setEditorLanguage] = useState<string>(() => {
		const storedEditorLanguage = localStorage.getItem("editorLanguage")
		return storedEditorLanguage ? storedEditorLanguage : "javascript"
	})
	const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

	// Code view related
	const [codeViewThemeName, setCodeViewThemeName] = useState<string>("dark")
	const [codeViewStyle, setCodeViewStyle] = useState(null)

	const user = useUser()
	const defaultCodeEditorValue = ""

	useEffect(() => {
		const storedSnippetId = localStorage.getItem("snippetId")
		if (storedSnippetId) {
			setSnippetId(storedSnippetId)
		} else {
			const newSnippetId = generateBase64uuid()
			setSnippetId(newSnippetId)
			localStorage.setItem("snippetId", newSnippetId)
		}
	}, [])

	useEffect(() => {
		localStorage.setItem("code", code)
	}, [code])

	useEffect(() => {
		localStorage.setItem("editorLanguage", editorLanguage)
	}, [editorLanguage])

	const handleCodeSave = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsSubmitted(true)

		const newSnippet: CreateSnippetProps = {
			id: snippetId,
			userId: user?.id,
			value: code,
			lang: editorLanguage,
		}

		createSnippet(newSnippet)
	}

	useEffect(() => {
		const loadCodeViewStyle = async () => {
			try {
				const style = await import(
					`react-syntax-highlighter/dist/esm/styles/hljs/${codeViewThemeName}`
				).then((module) => module.default)
				setCodeViewStyle(style)
			} catch (error) {
				console.error("Error loading style:", error)
			}
		}

		loadCodeViewStyle()
	}, [codeViewThemeName])

	const handleDiscardSnippet = () => {
		setCode("")
		setEditorLanguage("javascript")
		setIsAddingSnippet(false)
		// Removes all values in localStorage
		localStorage.removeItem("code")
		localStorage.removeItem("editorLanguage")
		localStorage.removeItem("snippetId")
	}

	return (
		<>
			{isSubmitted ? (
				<div className="w-[80vw] flex-col gap-2">
					<div className="flex w-full items-center justify-between gap-2">
						<div>
							<Badge className="italic">{editorLanguage}</Badge>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								className="p-5"
								onClick={() => setIsSubmitted(false)}
							>
								Edit
							</Button>

							<Select onValueChange={(e) => setCodeViewThemeName(e)}>
								<SelectTrigger className="w-[200px]">
									<SelectValue placeholder={codeViewThemeName} />
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
							<SyntaxHighlighter
								showLineNumbers={true}
								language="javascript"
								style={codeViewStyle}
							>
								{code}
							</SyntaxHighlighter>
						)}
					</div>
				</div>
			) : (
				<div className="flex w-full flex-col">
					<div className="w-screen">
						<div className="w-full max-w-[1000px] flex-col gap-2 rounded-lg border p-4">
							<div className="flex-between">
								<Select onValueChange={(e) => setEditorLanguage(e)}>
									<SelectTrigger className="w-[130px] self-end">
										<SelectValue placeholder={editorLanguage} />
									</SelectTrigger>
									<SelectContent>
										{SyntaxHighlighter.supportedLanguages.map(
											(language: string) => (
												<SelectItem key={language} value={language}>
													{firstLetterToUpper(language)}
												</SelectItem>
											),
										)}
									</SelectContent>
								</Select>

								<Button variant="ghost" onClick={handleDiscardSnippet}>
									<X />
								</Button>
							</div>

							<form onSubmit={handleCodeSave}>
								<div className="">
									<label htmlFor="comment" className="sr-only">
										Add your code
									</label>

									<Editor
										height="300px"
										value={code || ""}
										onChange={(value) => setCode(value || "")}
										theme="vs-dark"
										language={editorLanguage}
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
											type="submit"
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
