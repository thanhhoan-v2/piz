"use client"

import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea"
import { cn } from "@utils/cn"
import { BoxIcon, CornerRightUp } from "lucide-react"
import { useEffect, useState } from "react"

interface AIInputWithLoadingProps {
	id?: string
	placeholder?: string
	minHeight?: number
	maxHeight?: number
	loadingDuration?: number
	thinkingDuration?: number
	onSubmit?: (value: string) => void | Promise<void>
	className?: string
	autoAnimate?: boolean
	value?: string
	onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
	onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

export default function ChatInput({
	id = "chat-input",
	placeholder = "Ask me anything!",
	minHeight = 56,
	maxHeight = 200,
	loadingDuration = 3000,
	thinkingDuration = 1000,
	onSubmit,
	className,
	autoAnimate = false,
	value,
	onChange,
	onKeyDown,
}: AIInputWithLoadingProps) {
	const [inputValue, setInputValue] = useState("")
	const [submitted, setSubmitted] = useState(autoAnimate)
	const [isAnimating, setIsAnimating] = useState(autoAnimate)

	const { textareaRef, adjustHeight } = useAutoResizeTextarea({
		minHeight,
		maxHeight,
	})

	useEffect(() => {
		let timeoutId: NodeJS.Timeout

		const runAnimation = () => {
			if (!isAnimating) return
			setSubmitted(true)
			timeoutId = setTimeout(() => {
				setSubmitted(false)
				timeoutId = setTimeout(runAnimation, thinkingDuration)
			}, loadingDuration)
		}

		if (isAnimating) {
			runAnimation()
		}

		return () => clearTimeout(timeoutId)
	}, [isAnimating, loadingDuration, thinkingDuration])

	// Add effect to adjust height when value changes
	useEffect(() => {
		if (textareaRef.current) {
			adjustHeight()
		}
	}, [value, inputValue, adjustHeight, textareaRef])

	const handleSubmit = async () => {
		const currentValue = value ?? inputValue
		if (!currentValue.trim() || submitted) return

		setSubmitted(true)
		await onSubmit?.(currentValue)

		// Only clear internal state if we're not controlled
		if (!value) {
			setInputValue("")
		}

		// Reset height after clearing input
		if (textareaRef.current) {
			textareaRef.current.style.height = `${minHeight}px`
		}

		setTimeout(() => {
			setSubmitted(false)
		}, loadingDuration)
	}

	return (
		<div className={cn("w-[80vw] fixed bottom-0 bg-background transition-all", className)}>
			<div className="relative flex flex-col items-center gap-2 mx-auto w-full max-w-[80vw]">
				<div className="relative mx-auto w-full transition-all">
					<Textarea
						id={id}
						placeholder={placeholder}
						className={cn(
							"bg-black/5 dark:bg-white/5 w-full rounded-3xl pl-6 pr-10 py-4",
							"placeholder:text-black/70 dark:placeholder:text-white/70",
							"border-none ring-black/30 dark:ring-white/30",
							"text-black dark:text-white resize-none text-wrap leading-[1.2]",
							"overflow-hidden", // Add this to prevent scrollbar flash
							`min-h-[${minHeight}px]`
						)}
						ref={textareaRef}
						value={value ?? inputValue}
						onChange={(e) => {
							onChange?.(e)
							if (!onChange) {
								setInputValue(e.target.value)
								// Height will be adjusted by the useEffect
							}
						}}
						onKeyDown={(e) => {
							onKeyDown?.(e)
							if (!onKeyDown && e.key === "Enter" && e.metaKey) {
								e.preventDefault()
								handleSubmit()
							}
						}}
						disabled={submitted}
					/>
					<Button
						onClick={handleSubmit}
						className={cn(
							"absolute right-6 top-1/2 -translate-y-1/2 rounded-full p-2 w-[50px] py-1 px-1",
							submitted ? "bg-none" : "bg-black/5 dark:bg-white/5",
							(value ?? inputValue).trim() ? "cursor-pointer" : "cursor-not-allowed opacity-50"
						)}
						disabled={submitted || !(value ?? inputValue).trim()}
					>
						{submitted ? (
							<BoxIcon className="text-black animate-spin" />
						) : (
							<CornerRightUp
								className={cn(
									"w-4 h-4 transition-opacity",
									(value ?? inputValue).trim() ? "opacity-100" : "opacity-30"
								)}
							/>
						)}
					</Button>
				</div>
				<p className="mx-auto pl-4 h-8 text-black/70 dark:text-white/70 text-xs">
					{(submitted && "AI is thinking...") || "Press Enter + ⌘ to send"}
				</p>
			</div>
		</div>
	)
}
