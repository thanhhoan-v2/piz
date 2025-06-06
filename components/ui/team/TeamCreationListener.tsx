"use client"

import { useUser } from "@stackframe/stack"
import { useEffect } from "react"

/**
 * Component that listens for team creation events and sets the creator as admin.
 * This should be added to the app layout to ensure it's always active.
 */
export function TeamCreationListener() {
	const user = useUser()

	useEffect(() => {
		// Set up a MutationObserver to detect when a team is created through the Stack Auth UI
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
					// Check if we've been redirected to a team page after creation
					if (window.location.pathname.startsWith("/team/")) {
						console.log(
							"TeamCreationListener - Detected possible team creation via MutationObserver"
						)
						handleTeamPage()
					}
				}
			}
		})

		// Start observing the document body for changes
		observer.observe(document.body, { childList: true, subtree: true })

		// Function to handle navigation events that might indicate team creation
		const handleRouteChange = async () => {
			console.log("TeamCreationListener - Route change detected")
			handleTeamPage()
		}

		// Function to handle team page detection and admin setting
		const handleTeamPage = async () => {
			// Check if we're on a team page that might be newly created
			if (window.location.pathname.startsWith("/team/")) {
				const teamId = window.location.pathname.split("/")[2]

				console.log("TeamCreationListener - Detected team page:", teamId)

				if (teamId && user?.id) {
					try {
						// Check if this is a new team by looking for our admin metadata
						const response = await fetch(`/api/team/${teamId}/info`)
						const teamInfo = await response.json()

						// Log team info for debugging
						console.log("TeamCreationListener - Team info:", teamInfo)
						console.log("TeamCreationListener - Team admins:", teamInfo?.admins)
						console.log("TeamCreationListener - Current user ID:", user?.id)

						// If the team exists and doesn't have admins set, set the current user as admin
						if (teamInfo && (!teamInfo.admins || teamInfo.admins.length === 0)) {
							console.log(
								"TeamCreationListener - New team detected, setting creator as admin:",
								teamId
							)

							// Call our API to set the creator as admin
							const adminResponse = await fetch("/api/team/create", {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									teamId,
									userId: user.id,
								}),
							})

							if (adminResponse.ok) {
								console.log("Successfully set creator as admin")
							} else {
								console.error("Failed to set creator as admin")
							}
						}
					} catch (error) {
						console.error("Error checking team or setting admin:", error)
					}
				}
			}
		}

		// Add event listener for route changes
		window.addEventListener("popstate", handleRouteChange)

		// Check on initial load
		handleRouteChange()

		// Clean up
		return () => {
			window.removeEventListener("popstate", handleRouteChange)
			observer.disconnect()
		}
	}, [user?.id])

	// This component doesn't render anything
	return null
}
