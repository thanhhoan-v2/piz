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
import { firstLetterToUpper } from "@utils/string.helpers"
import { X } from "lucide-react"
import type { FormEvent } from "react"
import { useEffect, useState } from "react"
import SyntaxHighlighter from "react-syntax-highlighter"

export default function CodeEditor({
	setIsAddingSnippet,
}: { setIsAddingSnippet: (isAddingSnippet: boolean) => void }) {
	const [code, setCode] = useState<string | null>(null)
	const [editorLanguage, setEditorLanguage] = useState<string>("javascript")
	const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsSubmitted(true)
	}
	const defaultCodeEditorValue = ""

	const [codeViewThemeName, setCodeViewThemeName] = useState<string>("dark")
	const [codeViewStyle, setCodeViewStyle] = useState(null)

	useEffect(() => {
		const loadStyle = async () => {
			try {
				const style = await import(
					`react-syntax-highlighter/dist/esm/styles/hljs/${codeViewThemeName}`
				).then((module) => module.default)
				setCodeViewStyle(style)
			} catch (error) {
				console.error("Error loading style:", error)
			}
		}

		loadStyle()
	}, [codeViewThemeName])

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

								<Button
									variant="ghost"
									onClick={() => {
										setCode(null)
										setEditorLanguage("javascript")
										setIsAddingSnippet(false)
									}}
								>
									<X />
								</Button>
							</div>

							<form onSubmit={handleSubmit}>
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
