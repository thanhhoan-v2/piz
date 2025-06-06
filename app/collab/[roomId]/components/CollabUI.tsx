"use client"
import { searchUsers } from "@app/actions/search"
import { ChatBox } from "@components/chat/ChatBox"
import { Badge } from "@components/ui/Badge"
import { Button } from "@components/ui/Button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@components/ui/Dialog"
import { Input } from "@components/ui/Input"
import { RealtimeCursors } from "@components/ui/supabase-ui/realtime-cursor"
import { Editor } from "@monaco-editor/react"
import {
	CheckCircle,
	Clock,
	Code,
	CopyIcon,
	InfoIcon,
	Link2,
	Loader2,
	MessageSquare,
	Search,
	Sparkles,
	UserIcon,
	UserPlus,
	X,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

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
	collabInfo: { id?: bigint; content?: string; room_id?: string; metadata?: any } | null
	handleCodeChange: (value: string | undefined) => void
}

// Define user search result type
type UserSearchResult = {
	id: string
	userName: string | null
	userAvatarUrl: string | null
	email: string
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
	const [showInviteDialog, setShowInviteDialog] = useState(false)
	const [showRoomInfoDialog, setShowRoomInfoDialog] = useState(false)
	const [searchQuery, setSearchQuery] = useState("")
	const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
	const [isSearching, setIsSearching] = useState(false)
	const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null)
	const [isInviting, setIsInviting] = useState(false)
	const [copied, setCopied] = useState(false)
	const [isCreatingEnhanced, setIsCreatingEnhanced] = useState(false)
	const router = useRouter()

	// For accessing the actual room IDs
	const actualRoomId = collabInfo?.id?.toString() || roomId
	const displayRoomId = collabInfo?.room_id || roomId

	// Debounce search
	const [debouncedQuery, setDebouncedQuery] = useState("")

	// Effect for debouncing search input
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setDebouncedQuery(searchQuery)
		}, 300)

		return () => clearTimeout(timeoutId)
	}, [searchQuery])

	// Effect for searching users
	useEffect(() => {
		const performSearch = async () => {
			const trimmedSearch = debouncedQuery.trim()
			if (!trimmedSearch || trimmedSearch.length < 2) {
				setSearchResults([])
				return
			}

			setIsSearching(true)
			try {
				const results = await searchUsers(debouncedQuery)
				setSearchResults(results)
			} catch (error) {
				console.error("Search error:", error)
				setSearchResults([])
			} finally {
				setIsSearching(false)
			}
		}

		performSearch()
	}, [debouncedQuery])

	const handleInviteUser = async () => {
		if (!selectedUser || !userId) return

		setIsInviting(true)
		try {
			// For debugging
			console.log("Invitation details:", {
				roomId: roomId,
				collabInfoId: collabInfo?.id?.toString(),
				actualRoomId: actualRoomId,
				displayRoomId: displayRoomId,
			})

			const response = await fetch("/api/collab/invite", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: selectedUser.id,
					roomId: actualRoomId,
					inviterId: userId,
					inviterName: userName,
					roomName: `Collaboration Room ${displayRoomId}`,
				}),
			})

			const data = await response.json()

			if (response.ok) {
				toast.success(`Invitation sent to ${selectedUser.userName || "user"}`)
				setShowInviteDialog(false)
				setSearchQuery("")
				setSelectedUser(null)
				setSearchResults([])

				console.log("Invitation success response:", data)
			} else {
				const errorMsg = data.error || "Failed to send invitation"
				console.error("Invitation error details:", data)
				toast.error(`${errorMsg}${data.details ? `: ${data.details}` : ""}`)
			}
		} catch (error) {
			toast.error("Failed to send invitation")
			console.error("Error inviting user:", error)
		} finally {
			setIsInviting(false)
		}
	}

	const copyRoomId = () => {
		const textToCopy = displayRoomId
		navigator.clipboard.writeText(textToCopy)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
		toast.success("Room ID copied to clipboard")
	}

	const clearSearch = () => {
		setSearchQuery("")
		setSearchResults([])
	}

	const createEnhancedVersion = async () => {
		if (!code || !userId) return

		setIsCreatingEnhanced(true)
		try {
			// Call the API to create a post from the collab room
			const response = await fetch("/api/collab/create-post-from-room", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					code: code,
					userId: userId,
					userName: userName,
					userAvatarUrl: null, // We don't have this info in the current context
					roomId: roomId,
					roomDisplayId: displayRoomId,
					language: "typescript", // Default language for Monaco editor
				}),
			})

			const data = await response.json()

			if (response.ok) {
				toast.success("Enhanced version posted to your profile!")
				// No need to redirect - we stay in the same room
			} else {
				toast.error("Failed to create enhanced version")
				console.error("Error creating enhanced version:", data)
			}
		} catch (error) {
			toast.error("Something went wrong")
			console.error("Failed to create enhanced version:", error)
		} finally {
			setIsCreatingEnhanced(false)
		}
	}

	return (
		<div className="flex flex-col w-full mt-[100px] h-screen">
			<div className="flex flex-col mx-auto px-4 pt-10 w-full max-w-6xl h-[80vh]">
				{/* Header with room info */}
				<div className="mb-4">
					<h1 className="mb-1 font-bold text-white text-2xl">Collaborative Editor</h1>
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<p className="text-gray-400 text-sm">Room ID: {displayRoomId}</p>
							<button
								onClick={() => setShowRoomInfoDialog(true)}
								className="text-gray-400 hover:text-gray-300"
								title="Room info"
							>
								<InfoIcon size={16} />
							</button>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								className="bg-emerald-900/30 border-emerald-800 text-emerald-400 hover:bg-emerald-800/50"
								onClick={createEnhancedVersion}
								disabled={isCreatingEnhanced}
							>
								{isCreatingEnhanced ? (
									<>
										<Loader2 size={14} className="mr-1.5 animate-spin" />
										<span>Creating...</span>
									</>
								) : (
									<>
										<Sparkles size={14} className="mr-1.5" />
										<span>Post as enhanced version</span>
									</>
								)}
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="bg-blue-900/30 border-blue-800 text-blue-400 hover:bg-blue-800/50"
								onClick={() => setShowInviteDialog(true)}
							>
								<UserPlus size={14} className="mr-1.5" />
								Invite
							</Button>
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

			{/* Room Info Dialog */}
			<Dialog open={showRoomInfoDialog} onOpenChange={setShowRoomInfoDialog}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Room Information</DialogTitle>
						<DialogDescription>Details about this collaboration room.</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<div className="space-y-4">
							<div>
								<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
									Display Room ID
								</h3>
								<div className="flex items-center mt-1 gap-2">
									<p className="text-lg font-mono">{displayRoomId}</p>
									<button
										onClick={copyRoomId}
										className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
										title="Copy Room ID"
									>
										{copied ? (
											<CheckCircle className="h-4 w-4 text-green-500" />
										) : (
											<CopyIcon className="h-4 w-4" />
										)}
									</button>
								</div>
							</div>

							<div>
								<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
									Internal DB ID
								</h3>
								<p className="mt-1 text-lg font-mono">{actualRoomId}</p>
							</div>

							{collabInfo?.metadata && (
								<div>
									<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Source</h3>
									<div className="mt-1">
										{(collabInfo.metadata as any)?.sourcePost && (
											<Badge
												variant="outline"
												className="mr-2 bg-blue-900/20 border-blue-800 text-blue-400"
											>
												<Link2 size={14} className="mr-1.5" />
												<span>From Post</span>
											</Badge>
										)}
										{(collabInfo.metadata as any)?.sourceSnippet && (
											<Badge
												variant="outline"
												className="bg-purple-900/20 border-purple-800 text-purple-400"
											>
												<Code size={14} className="mr-1.5" />
												<span>From Snippet</span>
											</Badge>
										)}
									</div>
								</div>
							)}

							<div>
								<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
									Active Users
								</h3>
								<div className="mt-1 flex flex-wrap gap-2">
									{Object.values(users).flat().length > 0 ? (
										Object.values(users)
											.flat()
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
										<span className="text-gray-500 dark:text-gray-400">No active users</span>
									)}
								</div>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button onClick={() => setShowRoomInfoDialog(false)}>Close</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Invite User Dialog */}
			<Dialog
				open={showInviteDialog}
				onOpenChange={(open) => {
					setShowInviteDialog(open)
					if (!open) {
						clearSearch()
						setSelectedUser(null)
					}
				}}
			>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Invite User to Collaboration</DialogTitle>
						<DialogDescription>
							Search for a user by username to invite them to this collaboration room.
						</DialogDescription>
					</DialogHeader>

					{/* User search */}
					<div className="py-4">
						<div className="relative">
							<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<Search className="w-4 h-4 text-gray-400" />
							</div>
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 pr-10"
								placeholder="Search users by username..."
							/>
							{searchQuery && (
								<button
									onClick={clearSearch}
									className="absolute inset-y-0 right-0 flex items-center pr-3"
								>
									<X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
								</button>
							)}
						</div>

						{/* Search results */}
						<div className="mt-2 max-h-60 overflow-y-auto">
							{isSearching ? (
								<div className="flex justify-center items-center py-4">
									<Loader2 className="w-5 h-5 animate-spin text-primary" />
								</div>
							) : searchResults.length > 0 ? (
								<ul className="space-y-1">
									{searchResults.map((user) => (
										<li key={user.id}>
											<button
												onClick={() => setSelectedUser(user)}
												className={`flex items-center gap-3 w-full p-2 rounded-md transition-colors ${
													selectedUser?.id === user.id
														? "bg-primary/10 text-primary"
														: "hover:bg-gray-100/10"
												}`}
											>
												<div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
													{user.userAvatarUrl ? (
														<img
															src={user.userAvatarUrl}
															alt={user.userName || "User"}
															className="w-full h-full object-cover"
														/>
													) : (
														<span>{user.userName?.[0].toUpperCase() || "U"}</span>
													)}
												</div>
												<div className="flex-1 text-left">
													<div className="font-medium">{user.userName || "Unknown user"}</div>
													<div className="text-xs text-gray-500">{user.email}</div>
												</div>
											</button>
										</li>
									))}
								</ul>
							) : searchQuery.length > 1 ? (
								<div className="text-center py-4 text-gray-500">No users found</div>
							) : searchQuery ? (
								<div className="text-center py-4 text-gray-500">
									Type at least 2 characters to search
								</div>
							) : null}
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowInviteDialog(false)
								clearSearch()
								setSelectedUser(null)
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={handleInviteUser}
							disabled={!selectedUser || isInviting}
							className="bg-primary text-primary-foreground hover:bg-primary/90"
						>
							{isInviting ? "Sending..." : "Send Invitation"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
