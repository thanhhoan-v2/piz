"use server"
import { stackServerApp } from "@/stack"

export async function getUserById(userId?: string) {
	if (userId) {
		const user = await stackServerApp.getUser(userId)
		return {
			userId: user?.id ?? "",
			userName: user?.displayName ?? "",
			avatarUrl: user?.profileImageUrl ?? "",
		}
	}
	console.log("[USER] Missing userId when fetching user")
}
