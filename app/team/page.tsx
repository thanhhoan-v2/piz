"use client"

import { Button } from "@components/ui/Button"
import { postWidths } from "@components/ui/post"
import { ROUTE } from "@constants/route"
import { useUser } from "@stackframe/stack"
import { cn } from "@utils/cn"
import { Globe, Plus, RefreshCw, Search, Shield, Users, UsersRound } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

type PublicTeam = {
	id: string
	displayName: string
	profileImageUrl: string | null
	createdAt: string
	isUserMember: boolean
	memberCount: number
}

type TabType = "my-teams" | "public-teams"

export default function TeamsPage() {
	// Get the user's teams using the useTeams hook from the @stackframe/stack library
	const user = useUser({ or: "redirect" })
	const teams = user.useTeams()

	// Get the router object from the useRouter hook
	const router = useRouter()

	// Get search parameters to check for refresh flag
	const searchParams = useSearchParams()

	// State for public teams and active tab
	const [publicTeams, setPublicTeams] = useState<PublicTeam[]>([]) // Initialize an empty array for the public teams
	const [loading, setLoading] = useState(false) // Initialize a boolean for the loading state
	const [fetchTimedOut, setFetchTimedOut] = useState(false) // Track if fetch timed out
	const [activeTab, setActiveTab] = useState<TabType>("my-teams") // Initialize the active tab to "my-teams"
	const [joiningTeamId, setJoiningTeamId] = useState<string | null>(null) // Track which team is being joined
	const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Reference to timeout

	// Force refresh of teams data when refresh parameter is present
	useEffect(() => {
		const shouldRefresh = searchParams.get("refresh") === "true"

		if (shouldRefresh) {
			// Clear the URL parameter without triggering a navigation
			const url = new URL(window.location.href)
			url.searchParams.delete("refresh")
			url.searchParams.delete("t")
			window.history.replaceState({}, "", url.toString())

			// Force a hard refresh of the page to get fresh data
			window.location.reload()
		}
	}, [searchParams])

	// Fetch public teams when the tab changes to public teams
	useEffect(() => {
		// If the active tab is "public-teams", fetch the public teams
		if (activeTab === "public-teams") {
			fetchPublicTeams()
		}

		// Cleanup function to clear timeout when component unmounts or tab changes
		return () => {
			if (fetchTimeoutRef.current) {
				clearTimeout(fetchTimeoutRef.current)
				fetchTimeoutRef.current = null
			}
		}
	}, [activeTab])

	// Function to fetch public teams with timeout
	async function fetchPublicTeams() {
		// Clear any existing timeout
		if (fetchTimeoutRef.current) {
			clearTimeout(fetchTimeoutRef.current)
			fetchTimeoutRef.current = null
		}

		// Reset states
		setLoading(true)
		setFetchTimedOut(false)

		// Set a timeout for the fetch operation (5 seconds)
		fetchTimeoutRef.current = setTimeout(() => {
			if (loading) {
				setFetchTimedOut(true)
				setLoading(false)
			}
		}, 5000) // 5 seconds timeout

		try {
			// Fetch the public teams from the API
			const response = await fetch("/api/team/public")

			// If the response is not OK, throw an error
			if (!response.ok) {
				throw new Error("Failed to fetch public teams")
			}

			// Get the data from the response
			const data = await response.json()

			// Clear the timeout since we got a response
			if (fetchTimeoutRef.current) {
				clearTimeout(fetchTimeoutRef.current)
				fetchTimeoutRef.current = null
			}

			// Set the public teams state to the data
			setPublicTeams(data)
			setFetchTimedOut(false)
		} catch (error) {
			// Log any errors to the console
			console.error("Error fetching public teams:", error)
		} finally {
			// Set the loading state to false
			setLoading(false)
		}
	}

	// Function to join a team directly from the listing
	const joinTeam = useCallback(
		async (teamId: string, event: React.MouseEvent) => {
			// Stop propagation to prevent navigation to team page
			event.stopPropagation()

			if (joiningTeamId || !user) return

			try {
				setJoiningTeamId(teamId)

				const response = await fetch("/api/team/join", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						teamId,
						userId: user.id,
					}),
				})

				if (!response.ok) {
					throw new Error("Failed to join team")
				}

				// Show success message
				const teamName = publicTeams.find((team) => team.id === teamId)?.displayName || "team"
				toast.success(`Successfully joined ${teamName}`)

				// Navigate to the teams page with refresh parameter after joining
				router.push(`${ROUTE.TEAMS}?refresh=true&t=${Date.now()}`)
			} catch (error) {
				console.error("Error joining team:", error)
				toast.error("Failed to join team")
				setJoiningTeamId(null)
			}
		},
		[joiningTeamId, router, user, publicTeams],
	)

	return (
		<div className={cn("mx-auto  p-4 container", postWidths)}>
			<div className="flex justify-between items-center mb-8">
				<div className="flex items-center gap-3">
					<div className="bg-primary/10 p-3 rounded-lg">
						<UsersRound className="w-6 h-6 text-primary" />
					</div>
					<div>
						<h1 className="font-bold text-2xl">Teams</h1>
						<p className="text-muted-foreground text-sm">
							Manage your teams and discover public teams
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<Button
						onClick={() => router.push("/handler/create-team")}
						className="flex items-center gap-2"
					>
						<Plus className="w-4 h-4" /> Create New Team
					</Button>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex justify-between items-center mb-8 border-b">
				<div className="flex">
					<button
						type="button"
						className={`px-4 py-3 font-medium flex items-center gap-2 ${
							activeTab === "my-teams"
								? "border-b-2 border-primary text-primary"
								: "text-gray-500 hover:text-gray-700"
						}`}
						onClick={() => setActiveTab("my-teams")}
					>
						<Shield
							className={`h-4 w-4 ${activeTab === "my-teams" ? "text-primary" : "text-gray-500"}`}
						/>
						My Teams
					</button>
					<button
						type="button"
						className={`px-4 py-3 font-medium flex items-center gap-2 ${
							activeTab === "public-teams"
								? "border-b-2 border-primary text-primary"
								: "text-gray-500 hover:text-gray-700"
						}`}
						onClick={() => setActiveTab("public-teams")}
					>
						<Globe
							className={`h-4 w-4 ${activeTab === "public-teams" ? "text-primary" : "text-gray-500"}`}
						/>
						Public Teams
					</button>
				</div>

				{/* Search and refresh buttons */}
				<div className="flex items-center gap-2">
					{activeTab === "public-teams" && (
						<div className="relative">
							<div className="top-1/2 left-2.5 absolute text-gray-400 -translate-y-1/2 transform">
								<Search className="w-4 h-4" />
							</div>
							<input
								type="text"
								placeholder="Search teams..."
								className="bg-background py-2 pr-4 pl-9 border border-gray-300 dark:border-gray-700 focus:border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
							/>
						</div>
					)}
					{activeTab === "public-teams" && !loading && (
						<Button
							variant="outline"
							size="sm"
							onClick={fetchPublicTeams}
							className="flex items-center gap-2"
							disabled={loading}
						>
							<RefreshCw className="w-4 h-4" />
							Refresh
						</Button>
					)}
				</div>
			</div>

			{/* My Teams Tab Content */}
			{activeTab === "my-teams" &&
				(teams.length === 0 ? (
					<div className="bg-gray-50 dark:bg-gray-900/50 py-12 border border-gray-300 dark:border-gray-700 border-dashed rounded-lg text-center">
						<div className="flex flex-col items-center gap-4">
							<div className="bg-primary/10 p-4 rounded-full">
								<Users className="w-8 h-8 text-primary" />
							</div>
							<div className="space-y-2">
								<h3 className="font-medium text-lg">No Teams Found</h3>
								<p className="mx-auto max-w-md text-gray-500">
									You don't have any teams yet. Create your first team to start collaborating with
									others.
								</p>
							</div>
							<Button
								onClick={() => router.push("/handler/create-team")}
								className="flex items-center gap-2 mt-2"
							>
								<Plus className="w-4 h-4" /> Create Your First Team
							</Button>
						</div>
					</div>
				) : (
					<div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
						{teams.map((team) => (
							<Link
								href={`/team/${team.id}`}
								key={team.id}
								className="bg-cynical-black hover:shadow-md p-4 rounded-lg transition-shadow cursor-pointer"
							>
								<div className="flex items-center mb-2">
									{team.profileImageUrl ? (
										<img
											src={team.profileImageUrl}
											alt={team.displayName}
											className="mr-3 rounded-full w-10 h-10"
										/>
									) : (
										<div className="flex justify-center items-center bg-gray-200 mr-3 rounded-full w-10 h-10">
											{team.displayName.charAt(0)}
										</div>
									)}
									<h2 className="font-semibold text-lg">{team.displayName}</h2>
								</div>

								{/* <div className="mb-2 text-gray-500 text-sm">{team.memberCount} Members</div> */}
							</Link>
						))}
					</div>
				))}

			{/* Public Teams Tab Content */}
			{activeTab === "public-teams" &&
				(loading ? (
					<div className="py-8 text-center">
						<div className="flex flex-col items-center gap-2">
							<div className="border-4 border-primary border-t-transparent rounded-full w-8 h-8 animate-spin" />
							<p className="text-gray-500">Loading public teams...</p>
						</div>
					</div>
				) : fetchTimedOut ? (
					<div className="py-8 text-center">
						<div className="flex flex-col items-center gap-4">
							<p className="text-gray-500">Fetching public teams timed out after 5 seconds.</p>
							<Button
								variant="outline"
								onClick={fetchPublicTeams}
								className="flex items-center gap-2"
							>
								<RefreshCw className="w-4 h-4" />
								Try Again
							</Button>
						</div>
					</div>
				) : publicTeams.length === 0 ? (
					<div className="py-8 text-center">
						<p className="text-gray-500">No public teams available</p>
					</div>
				) : (
					<div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
						{publicTeams.map((team) => (
							<div
								key={team.id}
								className="hover:shadow-md p-4 border rounded-lg transition-shadow cursor-pointer"
								onClick={() => {
									toast.info(`Navigating to ${team.displayName}...`)
									router.push(`/team/${team.id}`)
								}}
							>
								<div className="flex items-center mb-2">
									{team.profileImageUrl ? (
										<img
											src={team.profileImageUrl}
											alt={team.displayName}
											className="mr-3 rounded-full w-10 h-10"
										/>
									) : (
										<div className="flex justify-center items-center bg-gray-200 mr-3 rounded-full w-10 h-10">
											{team.displayName.charAt(0)}
										</div>
									)}
									<h2 className="font-semibold text-lg">{team.displayName}</h2>
								</div>

								<div className="mb-2 text-gray-500 text-sm">
									{team.memberCount} {team.memberCount === 1 ? "Member" : "Members"}
								</div>

								<div className="flex justify-between items-center mt-2">
									<div className="inline-block bg-green-100 px-2 py-1 rounded text-green-800 text-xs">
										Public
									</div>

									{team.isUserMember ? (
										<div className="inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded text-blue-600 text-xs">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="12"
												height="12"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<path d="M20 6 9 17l-5-5" />
											</svg>
											Joined
										</div>
									) : (
										<Button
											variant="outline"
											size="sm"
											onClick={(e) => joinTeam(team.id, e)}
											disabled={joiningTeamId === team.id}
										>
											{joiningTeamId === team.id ? "Joining..." : "Join"}
										</Button>
									)}
								</div>
							</div>
						))}
					</div>
				))}
		</div>
	)
}
