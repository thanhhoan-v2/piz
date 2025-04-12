/**
 * Check if a user is an admin of a team
 * @param team The team object
 * @param userId The user ID to check
 * @returns boolean indicating if the user is an admin
 */
export function isTeamAdmin(team: any, userId: string): boolean {
	if (!team || !userId) return false

	// Check if the team has admins in clientMetadata
	const admins = team.clientMetadata?.admins

	if (!admins || !Array.isArray(admins)) return false

	// Check if the user ID is in the admins array
	return admins.includes(userId)
}

/**
 * Get the role of a user in a team
 * @param team The team object
 * @param userId The user ID to check
 * @returns 'admin' or 'member'
 */
export function getUserTeamRole(team: any, userId: string): "admin" | "member" {
	return isTeamAdmin(team, userId) ? "admin" : "member"
}
