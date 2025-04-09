"use client"

import { Button } from "@components/ui/Button"
import { TeamJoinRequests } from "@components/ui/team/TeamJoinRequests"
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
	const [isMember, setIsMember] = useState<boolean>(true) // Default to true until we check
	const [hasRequestedToJoin, setHasRequestedToJoin] = useState<boolean>(false)
	const [isLeaving, setIsLeaving] = useState<boolean>(false)
	const [showLeaveConfirmation, setShowLeaveConfirmation] = useState<boolean>(false)

	// Mutation for creating join request
	const createJoinRequest = useCreateTeamJoinRequest()

	// Check if user has permission to update team
	const hasUpdatePermission = team ? user.usePermission(team, "$update_team") : false

	// Effect to initialize isPublic state from team metadata and check membership
	useEffect(() => {
		if (team) {
			setIsPublic(team.clientMetadata?.isPublic === true)

			// Check if the user is a member of the team
			// If team.useUsers() returns users, the user is a member
			// If it returns null, the user is not a member
			setIsMember(users !== null)
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
				},
			},
		)
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
					The team you're looking for doesn't exist or you don't have access to it.
				</p>
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

					{/* Show Request to Join button for non-members if the team is public */}
					{!isMember && isPublic && (
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
							: "This is a public team. You can request to join this team to participate."}
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

			{/* Leave Team Confirmation Dialog */}
			{showLeaveConfirmation && (
				<div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
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
				</div>
			)}
		</div>
	)
}
