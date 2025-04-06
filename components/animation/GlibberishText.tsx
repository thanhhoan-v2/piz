"use client"
import { cn } from "@utils/cn"
import { useEffect, useState } from "react"

interface GibberishTextProps {
	/* The text to animate */
	text: string
	/* The class name to apply to each letter */
	className?: string
	/* The colors to cycle through during the transformation */
	colors?: string[]
}

interface LetterProps {
	letter: string
	className?: string
	colors?: string[]
}

const Letter = ({ letter, className, colors = ["text-foreground"] }: LetterProps) => {
	const [code, setCode] = useState(letter.toUpperCase().charCodeAt(0))
	const [colorIndex, setColorIndex] = useState(0)

	useEffect(() => {
		let count = Math.floor(Math.random() * 10) + 5
		const interval = setInterval(() => {
			setCode(() => Math.floor(Math.random() * 26) + 65)
			setColorIndex((prevIndex) => (prevIndex + 1) % colors.length)
			count--
			if (count === 0) {
				setCode(letter.toUpperCase().charCodeAt(0))
				clearInterval(interval)
			}
		}, 60)

		return () => clearInterval(interval)
	}, [letter, colors.length])

	return (
		<span className={cn("whitespace-pre", colors[colorIndex], className)}>
			{String.fromCharCode(code)}
		</span>
	)
}

/**
 * Animate each letter in the text using gibberish text effect.
 * Renders a random letter first and then animates it to the correct letter.
 */
export default function GibberishText({ text, className, colors }: GibberishTextProps) {
	return (
		<>
			{text.split("").map((letter, index) => {
				return (
					<Letter
						className={className}
						letter={letter}
						colors={colors}
						key={`${index}-${letter}`}
					/>
				)
			})}
		</>
	)
}
