import { type CoreMessage, generateText } from "ai"

import { createOllama } from "ollama-ai-provider"

const ollama = createOllama()
// Changed from deepseek to a different model
const model = ollama("llama3")

export async function POST(req: Request) {
	const { messages }: { messages: CoreMessage[] } = await req.json()

	const { response } = await generateText({
		model: model,
		system: "You are a helpful assistant.",
		messages,
	})

	return Response.json({ messages: response.messages })
}
