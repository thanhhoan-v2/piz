"use client"
import { ChatBox } from "@components/chat/ChatBox"
import { Badge } from "@components/ui/Badge"
import { RealtimeCursors } from "@components/ui/supabase-ui/realtime-cursor"
import { Editor } from "@monaco-editor/react"
import { CheckCircle, Clock, MessageSquare, UserIcon } from "lucide-react"
import { useState } from "react"

export type PresenceUser = {
	userId: string
	userName: string
	presence_ref: string
}

export type PresenceState = {
	[key: string]: PresenceUser[]
}

interface CollabUIProps {
	roomId: string
	code: string
	users: PresenceState
	saveStatus: "saving" | "saved"
	userId?: string
	userName: string
	collabInfo: { id?: bigint; content?: string } | null
	handleCodeChange: (value: string | undefined) => void
}

export function CollabUI({
	roomId,
	code,
	users,
	saveStatus,
	userId,
	userName,
	collabInfo,
	handleCodeChange,
}: CollabUIProps) {
	const [showChat, setShowChat] = useState(true)

	return (
		<div className="flex flex-col w-full mt-[100px] h-screen">
			<div className="flex flex-col mx-auto px-4 pt-10 w-full max-w-6xl h-[80vh]">
				{/* Header with room info */}
				<div className="mb-4">
					<h1 className="mb-1 font-bold text-white text-2xl">Collaborative Editor</h1>
					<div className="flex justify-between items-center">
						<p className="text-gray-400 text-sm">Room ID: {roomId}</p>
						<div className="flex items-center gap-2">
							<Badge
								variant="secondary"
								className="bg-blue-900/30 border-blue-800 text-blue-400 py-[7px]"
							>
								<UserIcon size={14} className="mr-1.5" />
								<span>Logged in as: {userName}</span>
							</Badge>
							<button
								type="button"
								onClick={() => setShowChat(!showChat)}
								className="p-2 rounded-md bg-blue-900/30 border border-blue-800 text-blue-400 hover:bg-blue-800/50 transition-colors"
								title={showChat ? "Hide chat" : "Show chat"}
							>
								<MessageSquare size={14} />
							</button>
						</div>
					</div>
				</div>

				{/* Main content area */}
				<div className="flex flex-row gap-4 h-full">
					{/* Editor container */}
					<div
						className={`flex flex-col flex-grow ${showChat ? "w-2/3" : "w-full"} bg-gray-800 shadow-xl border border-gray-700 rounded-lg overflow-hidden transition-all duration-300`}
					>
						{/* Top bar with users and status */}
						<div className="bg-gray-800 p-4 border-gray-700 border-b">
							<div className="flex justify-between items-center">
								{/* Users section */}
								<div className="flex items-center gap-3">
									{/* Other users */}
									{Object.values(users)
										.flat()
										.filter((user) => user.userId !== userId).length > 0 ? (
										Object.values(users)
											.flat()
											.filter((user) => user.userId !== userId)
											.map((user) => (
												<Badge
													key={user.presence_ref}
													variant="outline"
													className="bg-purple-900/20 border-purple-800 text-purple-400"
												>
													<UserIcon size={14} className="mr-1.5" />
													<span>{user.userName || "Anonymous"}</span>
												</Badge>
											))
									) : (
										<Badge variant="outline" className="bg-gray-800 border-gray-700 text-gray-400">
											<span>No one else is here</span>
										</Badge>
									)}
								</div>

								{/* Save status */}
								<div>
									{saveStatus === "saving" ? (
										<Badge
											variant="outline"
											className="bg-yellow-900/20 border-yellow-800 text-yellow-400"
										>
											<Clock size={14} className="mr-1.5 animate-pulse" />
											Saving...
										</Badge>
									) : (
										<Badge
											variant="outline"
											className="bg-green-900/20 border-green-800 text-green-400"
										>
											<CheckCircle size={14} className="mr-1.5" />
											Saved
										</Badge>
									)}
								</div>
							</div>
						</div>

						{/* Editor */}
						<div className="flex-grow relative">
							<div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
								<RealtimeCursors roomName={roomId} username={userName} />
							</div>
							<Editor
								height="100%"
								defaultLanguage="typescript"
								value={code}
								onChange={handleCodeChange}
								options={{
									minimap: { enabled: false },
									fontSize: 14,
									lineHeight: 1.5,
									fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
									scrollBeyondLastLine: false,
									automaticLayout: true,
									padding: { top: 16 },
								}}
								theme="vs-dark"
								className="h-full"
							/>
						</div>
					</div>

					{/* Chat box */}
					{showChat && (
						<div className="w-1/3 flex-shrink-0 transition-all duration-300">
							<ChatBox
								roomId={collabInfo?.id?.toString() || roomId}
								userId={userId || ""}
								userName={userName}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
