"use client"

import { Button } from "@components/ui/Button"
import { Dialog, DialogContent } from "@components/ui/Dialog"
import { TeamJoinRequests } from "@components/ui/team/TeamJoinRequests"
import { TeamPosts } from "@components/ui/team/TeamPosts"
import { ROUTE } from "@constants/route"
import { useCreateTeamJoinRequest } from "@queries/client/teamJoinRequest"
import { SelectedTeamSwitcher, useUser } from "@stackframe/stack"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type TeamParams = { teamId: string }

export default function TeamPage({ params }: { params: TeamParams }) {
	const unwrappedParams = React.use(params as unknown as Promise<TeamParams>)
	const teamId = unwrappedParams.teamId
	const user = useUser({ or: "redirect" })
	const team = user.useTeam(teamId)
	const users = team?.useUsers()
	const router = useRouter()

	// State for public status and joining
	const [isPublic, setIsPublic] = useState<boolean>(false)
	const [updating, setUpdating] = useState<boolean>(false)
	const [isMember, setIsMember] = useState<boolean>(false) // Default to false until we check
	const [hasRequestedToJoin, setHasRequestedToJoin] = useState<boolean>(false)
	const [isJoining, setIsJoining] = useState<boolean>(false)
	const [isLeaving, setIsLeaving] = useState<boolean>(false)
	const [showLeaveConfirmation, setShowLeaveConfirmation] = useState<boolean>(false)

	// Mutation for creating join request
	const createJoinRequest = useCreateTeamJoinRequest()

	// Check if user has permission to update team
	const hasUpdatePermission = team ? user.usePermission(team, "$update_team") : false

	// Effect to initialize isPublic state from team metadata and check membership
	useEffect(() => {
		if (team) {
			// Set public status
			setIsPublic(team.clientMetadata?.isPublic === true)

			// Check if the user is a member of the team
			// This is the most reliable way to check membership
			const checkMembership = async () => {
				try {
					// First check: If users is not null, the user is definitely a member
					if (users !== null) {
						console.log("User is a member (users check)")
						setIsMember(true)
						return
					}

					// Second check: Use a direct API call to check membership
					const response = await fetch(`/api/team/${team.id}/check-membership?t=${Date.now()}`, {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							// Add cache busting headers
							"Cache-Control": "no-cache, no-store, must-revalidate",
							Pragma: "no-cache",
							Expires: "0",
						},
					})

					if (response.ok) {
						const data = await response.json()
						setIsMember(data.isMember)
					} else {
						console.error("Failed to check membership")
						// Default to false if we can't check
						setIsMember(false)
					}
				} catch (error) {
					console.error("Error checking membership:", error)
					// Default to false if we can't check
					setIsMember(false)
				}
			}

			checkMembership()
		}
	}, [team, users])

	// Function to toggle public status
	async function togglePublicStatus() {
		if (!team || !hasUpdatePermission) return

		try {
			setUpdating(true)
			const newStatus = !isPublic

			const response = await fetch("/api/team/update", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					teamId: team.id,
					isPublic: newStatus,
				}),
			})

			if (!response.ok) {
				throw new Error("Failed to update team")
			}

			setIsPublic(newStatus)
		} catch (error) {
			console.error("Error updating team:", error)
		} finally {
			setUpdating(false)
		}
	}

	// Function to request to join the team
	async function requestToJoinTeam() {
		if (!team || !user) return

		createJoinRequest.mutate(
			{ userId: user.id, teamId: team.id },
			{
				onSuccess: () => {
					setHasRequestedToJoin(true)
					toast.success("Join request sent successfully")
				},
				onError: (error) => {
					console.error("Error requesting to join team:", error)
					toast.error("Failed to send join request")
				},
			},
		)
	}

	// Function to join the team directly (for public teams)
	async function joinTeam() {
		if (!team || !user || isJoining) return

		try {
			setIsJoining(true)
			console.log("Joining team:", team.id, "User:", user.id)

			// Call the API to join the team
			const response = await fetch("/api/team/join", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					teamId: team.id,
					userId: user.id,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || "Failed to join team")
			}

			// Show success message
			toast.success("You have joined the team")
			console.log("Successfully joined team")

			// Set isMember to true to update the UI immediately
			setIsMember(true)

			// Refresh the page to update the UI
			// Use a timeout to ensure the state is updated before refreshing
			setTimeout(() => {
				// Force a hard reload with cache busting
				window.location.href = `/team/${team.id}?t=${Date.now()}`
			}, 1000)
		} catch (error) {
			console.error("Error joining team:", error)
			toast.error(error instanceof Error ? error.message : "Failed to join team")
		} finally {
			setIsJoining(false)
		}
	}

	// Function to leave the team
	async function leaveTeam() {
		if (!team || !user || isLeaving) return

		try {
			setIsLeaving(true)
			console.log("Leaving team:", team.id, "User:", user.id)

			// Close the confirmation dialog
			setShowLeaveConfirmation(false)

			// Try using the Stack Auth client-side API directly
			console.log("Using Stack Auth client-side API to leave team")
			try {
				// According to Stack Auth docs, we call leaveTeam on the user object
				await user.leaveTeam(team)
				console.log("Successfully left team using client-side API")
			} catch (clientApiError) {
				console.error("Error using client-side API:", clientApiError)

				// Fall back to our custom API endpoint
				console.log("Falling back to custom API endpoint")
				const payload = {
					teamId: team.id,
					userId: user.id,
				}
				console.log("Request payload:", payload)

				const response = await fetch("/api/team/leave", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				})

				console.log("Response status:", response.status)
				const responseText = await response.text()
				console.log("Response text:", responseText)

				let responseData: Record<string, unknown> | null = null
				try {
					responseData = JSON.parse(responseText)
					console.log("Response data:", responseData)
				} catch (e) {
					console.error("Error parsing response JSON:", e)
				}

				if (!response.ok) {
					console.error("Leave team error response:", responseData)
					throw new Error(
						`${responseData?.details || responseData?.error || "Failed to leave team"} (Status: ${response.status})`,
					)
				}
			}

			// Show success message
			toast.success("You have left the team")
			console.log("Successfully left team, redirecting to teams page")

			// Redirect to the teams page with a refresh parameter
			router.push(`${ROUTE.TEAMS}?refresh=true&t=${Date.now()}`)
		} catch (error) {
			console.error("Error leaving team:", error)
			toast.error(error instanceof Error ? error.message : "Failed to leave team")
			setIsLeaving(false)
		}
	}

	// Handle cases where the team doesn't exist or user doesn't have access
	if (!team) {
		return (
			<div className="flex flex-col justify-center items-center h-screen">
				<div className="mb-4 font-semibold text-xl">Team not found</div>
				<p className="mb-6 text-gray-500">
					The team you're looking for doesn't exist or you don't have access to it
				</p>
				<Button onClick={requestToJoinTeam}>Request to Join</Button>{" "}
				<Link href={ROUTE.TEAMS}>
					<Button>Go to Teams</Button>
				</Link>
			</div>
		)
	}

	return (
		<div className="mx-auto p-4 container">
			{isMember ? (
				<div className="mb-6">
					<SelectedTeamSwitcher urlMap={(team) => `/team/${team.id}`} selectedTeam={team} />
				</div>
			) : null}

			<div className="flex justify-between items-center mb-6">
				<h1 className="font-bold text-2xl">{team.displayName}</h1>

				<div className="flex gap-2">
					<Link href={ROUTE.TEAMS}>
						<Button variant="outline">Back to Teams</Button>
					</Link>

					{/* Show Join Team button for non-members if the team is public */}
					{!isMember && isPublic && (
						<Button onClick={joinTeam} disabled={isJoining || hasRequestedToJoin} variant="default">
							{isJoining ? "Joining..." : "Join Team"}
						</Button>
					)}

					{/* Show Request to Join button for non-members if the team is private */}
					{!isMember && !isPublic && (
						<Button
							onClick={requestToJoinTeam}
							disabled={createJoinRequest.isPending || hasRequestedToJoin}
							variant="default"
						>
							{createJoinRequest.isPending
								? "Sending Request..."
								: hasRequestedToJoin
									? "Request Sent"
									: "Request to Join"}
						</Button>
					)}

					{/* Show Leave Team button for members who are not admins */}
					{isMember && !hasUpdatePermission && (
						<Button
							onClick={() => setShowLeaveConfirmation(true)}
							variant="destructive"
							disabled={isLeaving}
						>
							{isLeaving ? "Leaving..." : "Leave Team"}
						</Button>
					)}

					{/* Show Make Public/Private button for team admins */}
					{hasUpdatePermission && (
						<Button
							onClick={togglePublicStatus}
							disabled={updating}
							variant={isPublic ? "default" : "outline"}
						>
							{updating ? "Updating..." : isPublic ? "Make Private" : "Make Public"}
						</Button>
					)}

					{/* Show Leave Team button for admins */}
					{isMember && hasUpdatePermission && (
						<Button
							onClick={() => setShowLeaveConfirmation(true)}
							variant="destructive"
							disabled={isLeaving}
						>
							{isLeaving ? "Leaving..." : "Leave Team"}
						</Button>
					)}
				</div>
			</div>

			{isPublic && (
				<div className="bg-green-100 mb-4 px-4 py-3 border border-green-400 rounded text-green-700">
					{isMember
						? "This team is public and visible to everyone."
						: hasRequestedToJoin
							? "Your request to join this team is pending approval."
							: "This is a public team. You can join this team immediately."}
				</div>
			)}

			{!isMember && !isPublic && (
				<div className="bg-yellow-100 mb-4 px-4 py-3 border border-yellow-400 rounded text-yellow-700">
					This is a private team. You need an invitation to join.
				</div>
			)}

			{/* Show join requests for team admins */}
			{isMember && hasUpdatePermission && <TeamJoinRequests teamId={team.id} />}

			<div className="bg-white shadow mb-6 p-6 rounded-lg">
				<h2 className="mb-4 font-semibold text-xl">Team Members</h2>
				<div className="space-y-2">
					{isMember ? (
						users?.map((user) => (
							<div key={user.id} className="flex items-center hover:bg-gray-50 p-2 rounded">
								{user.teamProfile.profileImageUrl ? (
									<img
										src={user.teamProfile.profileImageUrl}
										alt={user.teamProfile.displayName || "Team Member"}
										className="mr-3 rounded-full w-8 h-8"
									/>
								) : (
									<div className="flex justify-center items-center bg-gray-200 mr-3 rounded-full w-8 h-8">
										{(user.teamProfile.displayName || "A").charAt(0)}
									</div>
								)}
								<span>{user.teamProfile.displayName || "Team Member"}</span>
							</div>
						))
					) : (
						<div className="py-4 text-gray-500 text-center">
							{isPublic
								? "Join this team to see its members."
								: "You need to be a member to see the team members."}
						</div>
					)}
				</div>
			</div>

			{/* Show team posts for members */}
			{isMember && <TeamPosts teamId={team.id} />}

			{/* Leave Team Confirmation Dialog */}
			<Dialog open={showLeaveConfirmation} onOpenChange={setShowLeaveConfirmation}>
				<DialogContent className="rounded-md">
					<div className="bg-white shadow-lg p-6 rounded-lg w-full max-w-md">
						<h3 className="mb-4 font-bold text-xl">Leave Team</h3>
						<p className="mb-6">
							Are you sure you want to leave this team? You will need to be invited or request to
							join again.
						</p>
						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								onClick={() => setShowLeaveConfirmation(false)}
								disabled={isLeaving}
							>
								Cancel
							</Button>
							<Button variant="destructive" onClick={leaveTeam} disabled={isLeaving}>
								{isLeaving ? "Leaving..." : "Leave Team"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
