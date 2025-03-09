import { useRef } from "react"

interface UseAutoResizeTextareaProps {
	minHeight: number
	maxHeight: number
}

export const useAutoResizeTextarea = ({ minHeight, maxHeight }: UseAutoResizeTextareaProps) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const adjustHeight = () => {
		const textarea = textareaRef.current
		if (!textarea) return

		// Reset height temporarily to get the correct scrollHeight
		textarea.style.height = `${minHeight}px`

		// Get the scroll height and calculate new height
		const scrollHeight = textarea.scrollHeight
		const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)

		// Set the new height
		textarea.style.height = `${newHeight}px`

		// Enable/disable scrolling based on content height
		textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden"
	}

	return { textareaRef, adjustHeight }
}
