"use server"
import { stackServerApp } from "@/stack"

export async function getUserById(userId: string) {
    const user = await stackServerApp.getUser(userId)
    return {
        userId: user?.id ?? "",
        userName: user?.displayName ?? "",
        avatarUrl: user?.profileImageUrl ?? "",
    }
} 