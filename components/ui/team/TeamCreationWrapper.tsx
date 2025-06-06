"use client"

import { useSetTeamCreatorAsAdmin } from "@queries/client/team"
import { useUser } from "@stackframe/stack"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

interface TeamCreationWrapperProps {
	children: React.ReactNode
}

export function TeamCreationWrapper({ children }: TeamCreationWrapperProps) {
	const user = useUser()
	const router = useRouter()
	const setTeamCreatorAsAdmin = useSetTeamCreatorAsAdmin()

	// Listen for team creation events
	useEffect(() => {
		// Function to handle team creation events
		const handleTeamCreated = (event: CustomEvent) => {
			if (!event.detail || !event.detail.teamId) return

			const { teamId } = event.detail

			// Set the creator as admin
			if (user?.id) {
				setTeamCreatorAsAdmin.mutate(
					{ teamId, userId: user.id },
					{
						onSuccess: () => {
							console.log("User set as team admin successfully")
						},
						onError: (error) => {
							console.error("Failed to set user as team admin:", error)
						},
					}
				)
			}
		}

		// Add event listener for team creation
		window.addEventListener("teamCreated" as any, handleTeamCreated)

		// Clean up event listener
		return () => {
			window.removeEventListener("teamCreated" as any, handleTeamCreated)
		}
	}, [user, setTeamCreatorAsAdmin])

	return <>{children}</>
}

// Helper function to dispatch team creation event
export function dispatchTeamCreatedEvent(teamId: string) {
	// Create and dispatch a custom event
	const event = new CustomEvent("teamCreated", {
		detail: { teamId },
	})

	window.dispatchEvent(event)
}
