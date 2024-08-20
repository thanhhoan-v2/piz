"use client"
import type { UserProps } from "@prisma/global"
import { useUserStore } from "@stores/user-store"
import React from "react"

// Helper component to sync server-fetched user data with Zustand store on the client
export default function SetUserStore({ user }: { user: UserProps }) {
	const setUserId = useUserStore((state) => state.setUserId)
	const setEmail = useUserStore((state) => state.setEmail)
	const setUserName = useUserStore((state) => state.setUserName)
	const setFullName = useUserStore((state) => state.setFullName)
	const setUserAvatarUrl = useUserStore((state) => state.setUserAvatarUrl)

	React.useEffect(() => {
		const fetchUserData = async () => {
			if (user) {
				setUserId(user.id)
				setEmail(user.email)
				setUserName(user.user_metadata.user_name)
				setFullName(user.user_metadata.full_name)
				setUserAvatarUrl(user.user_metadata.avatar_url)
			}
		}

		fetchUserData()
	}, [user, setEmail, setFullName, setUserId, setUserName, setUserAvatarUrl])

	return null
}
