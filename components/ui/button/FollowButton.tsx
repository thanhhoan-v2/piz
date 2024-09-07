"use client"

import { userAtom } from "@atoms/user"
import { Button } from "@components/ui/Button"
import {
	checkIsFollowing,
	createFollow,
	deleteFollow,
} from "@queries/server/follow"
import { useAtomValue } from "jotai"
import React from "react"

type FollowButtonProps = {
	followerId: string
	followeeId: string
	className?: string
}

type RequestStatus = "ACCEPTED" | "PENDING" | "REJECTED"

export default function FollowButton({
	followerId, // the main user
	followeeId, // the user to follow
	className,
}: FollowButtonProps) {
	// Follow state
	const [followStatus, setFollowStatus] = React.useState<string | null>(null)

	const appUser = useAtomValue(userAtom)
	const appUserId = appUser?.id

	// Fetch if the user is following the user
	React.useEffect(() => {
		try {
			const handleCheckIsFollowing = async () => {
				const existingFollow = await checkIsFollowing({
					followerId,
					followeeId,
				})
				// If the user is following the user
				if (existingFollow?.requestStatus === ("ACCEPTED" as RequestStatus)) {
					setFollowStatus("ACCEPTED" as RequestStatus)
				}

				// If the request is pending
				if (existingFollow?.requestStatus === ("PENDING" as RequestStatus)) {
					setFollowStatus("PENDING" as RequestStatus)
				}
			}
			handleCheckIsFollowing()
		} catch (error) {
			console.error("Client Error checking if user is following", error)
		}
	}, [followerId, followeeId])

	// Follow the viewing user
	const handleFollow = async () => {
		const newFollow = await createFollow({ followerId, followeeId })
		if (newFollow?.requestStatus === ("ACCEPTED" as RequestStatus)) {
			setFollowStatus("ACCEPTED" as RequestStatus)
		}

		if (newFollow?.requestStatus === ("PENDING" as RequestStatus)) {
			setFollowStatus("PENDING" as RequestStatus)
		}
	}

	// Unfollow the viewing user
	const handleUnfollow = async () => {
		const deletedFollow = await deleteFollow({ followerId, followeeId })
		if (deletedFollow) setFollowStatus(null)
	}

	// If the user is viewing their own profile
	if (appUserId === followeeId) return null

	// If the request is (already) accepted
	if (followStatus === "ACCEPTED")
		return (
			<Button
				onClick={handleUnfollow}
				className={`${className} bg-pink-600 font-bold text-white hover:bg-pink-400`}
			>
				Following
			</Button>
		)

	// If the request is pending
	if (followStatus === "PENDING")
		return (
			<Button
				onClick={handleUnfollow}
				className={`${className} bg-cyan-500 font-italic text-white hover:bg-cyan-400`}
			>
				Pending
			</Button>
		)

	// If the user is not following or requesting to follow the viewing user
	return (
		<Button className={`${className}`} onClick={handleFollow}>
			Follow
		</Button>
	)
}
