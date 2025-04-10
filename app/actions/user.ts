"use server"
import { stackServerApp } from "@/stack"

export async function getUserById(userId?: string) {
	if (!userId) {
		console.log("[USER] Missing userId when fetching user")
		return {
			userId: "",
			userName: "Unknown User",
			userAvatarUrl: "",
		}
	}

	try {
		const user = await stackServerApp.getUser(userId)
		return {
			userId: user?.id ?? userId,
			userName: user?.displayName ?? "Unknown User",
			userAvatarUrl: user?.profileImageUrl ?? "",
		}
	} catch (error) {
		console.error(`[USER] Error fetching user with ID ${userId}:`, error)
		return {
			userId: userId,
			userName: "Unknown User",
			userAvatarUrl: "",
		}
	}
}
