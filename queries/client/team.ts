"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKey } from "@utils/queryKeyFactory"

// Hook to set a user as admin after team creation
export const useSetTeamCreatorAsAdmin = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
			const response = await fetch("/api/team/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ teamId, userId }),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || "Failed to set team admin")
			}

			return response.json()
		},
		onSuccess: () => {
			// No need for a toast here as this happens right after team creation
			// and we don't want to confuse the user with multiple messages

			// Invalidate team queries to ensure fresh data
			queryClient.invalidateQueries({ queryKey: queryKey.team.all })
		},
		onError: (error) => {
			console.error("Error setting team admin:", error)
			// We don't show an error toast here as it's a background operation
			// that shouldn't interrupt the user flow
		},
	})
}
