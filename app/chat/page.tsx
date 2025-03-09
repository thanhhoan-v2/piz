"use client"

import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "@components/ui/chat/ChatBubble"
import ChatInput from "@components/ui/chat/ChatInput"
import { MemoizedMarkdown } from "@components/ui/chat/ChatMemoizedMarkdown"
import { ChatMessageList } from "@components/ui/chat/ChatMessageList"
import type { CoreMessage } from "ai"
import { useState } from "react"

const cleanAIResponse = (content: string) => {
	return content
		.replace(/<think>[\s\S]*?<\/think>/g, "") // Remove <think>...</think> blocks
		.replace(/<think>/g, "") // Remove standalone <think>
		.trim()
}

export default function ChatPage() {
	const [input, setInput] = useState("")
	const [messages, setMessages] = useState<CoreMessage[]>([])

	return (
		<div className="mt-[100px] mb-[10px] w-[80vw]">
			<div className="flex flex-col h-full">
				<div className="flex-1 h-auto max-h-[70vh]">
					<ChatMessageList>
						{messages.map((message, index) => (
							<ChatBubble
								key={`${message.role}-${index}`}
								variant={message.role === "user" ? "sent" : "received"}
							>
								<ChatBubbleAvatar fallback={message.role === "user" ? "U" : "AI"} />
								<ChatBubbleMessage variant={message.role === "user" ? "sent" : "received"}>
									{typeof message.content === "string" ? (
										<MemoizedMarkdown content={message.content} id={`message-${index}`} />
									) : (
										<div className="message-content">
											{message.content
												.filter((part) => part.type === "text")
												.map((part, partIndex) => (
													<div
														className="space-y-2 prose"
														key={`part-${
															// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
															partIndex
														}`}
													>
														<MemoizedMarkdown content={part.text} id={`part-${partIndex}`} />
													</div>
												))}
										</div>
									)}
								</ChatBubbleMessage>
							</ChatBubble>
						))}
					</ChatMessageList>
				</div>

				<ChatInput
					value={input}
					onChange={(event) => setInput(event.target.value)}
					onSubmit={async (value) => {
						setMessages((currentMessages) => [...currentMessages, { role: "user", content: value }])
						const response = await fetch("/api/chat", {
							method: "POST",
							body: JSON.stringify({
								messages: [...messages, { role: "user", content: value }],
							}),
						})

						const { messages: newMessages } = await response.json()
						setMessages((currentMessages) => [...currentMessages, ...newMessages])
					}}
				/>
			</div>
		</div>
	)
}
