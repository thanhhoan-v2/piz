// import { deepseek } from '@ai-sdk/deepseek';

import { createDeepSeek } from "@ai-sdk/deepseek"
import { generateText } from "ai"

const deepseek = createDeepSeek({
	apiKey: process.env.DEEPSEEK_API_KEY ?? "",
})

export async function getCodeReview(code: string, language?: string | null) {
	try {
		const prompt = `Review this ${language} code and provide concise, actionable feedback focusing on code quality, best practices, and potential improvements: ${code}`

		const { reasoning, text } = await generateText({
			model: deepseek("deepseek-reasoner"),
			prompt: prompt,
		})

		return text || "No review feedback available"
	} catch (error) {
		console.error("Error getting code review:", error)
		throw new Error("Failed to get code review")
	}
}
