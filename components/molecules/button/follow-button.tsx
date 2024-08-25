"use client"

import { Button } from "@components/atoms/button"
import { useQueryDataAppUser } from "@hooks/queries/app-user"
import type { $Enums } from "@prisma/client"
import {
	type CreateFollowProps,
	checkIsFollowing,
	createFollow,
	deleteFollow,
} from "@prisma/functions/follow"
import React from "react"

export default function FollowButton({
	followerId, // the main user
	followeeId, // the user to follow
}: CreateFollowProps) {
	// Follow state
	const [followStatus, setFollowStatus] = React.useState<string | null>(null)

	const appUser = useQueryDataAppUser()
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
				if (
					existingFollow?.requestStatus === ("ACCEPTED" as $Enums.FollowStatus)
				) {
					setFollowStatus("ACCEPTED" as $Enums.FollowStatus)
				}

				// If the request is pending
				if (
					existingFollow?.requestStatus === ("PENDING" as $Enums.FollowStatus)
				) {
					setFollowStatus("PENDING" as $Enums.FollowStatus)
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
		if (newFollow?.requestStatus === ("ACCEPTED" as $Enums.FollowStatus)) {
			setFollowStatus("ACCEPTED" as $Enums.FollowStatus)
		}

		if (newFollow?.requestStatus === ("PENDING" as $Enums.FollowStatus)) {
			setFollowStatus("PENDING" as $Enums.FollowStatus)
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
				className="bg-pink-600 font-bold text-white hover:bg-pink-400"
			>
				Following
			</Button>
		)

	// If the request is pending
	if (followStatus === "PENDING")
		return (
			<Button
				onClick={handleUnfollow}
				className="bg-cyan-500 font-italic text-white hover:bg-cyan-400"
			>
				Pending
			</Button>
		)

	// If the user is not following or requesting to follow the viewing user
	return <Button onClick={handleFollow}>Follow</Button>
}
