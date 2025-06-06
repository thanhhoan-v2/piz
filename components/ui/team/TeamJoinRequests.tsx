"use client"

import { getUserById } from "@app/actions/user"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/Avatar"
import { Button } from "@components/ui/Button"
import { ROUTE } from "@constants/route"
import {
	useAcceptTeamJoinRequest,
	useRejectTeamJoinRequest,
	useTeamJoinRequests,
} from "@queries/client/teamJoinRequest"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type UserInfo = {
	userId: string
	userName: string
	userAvatarUrl: string
}

export function TeamJoinRequests({ teamId }: { teamId: string }) {
	const { data: requests, isLoading } = useTeamJoinRequests(teamId)
	const [usersInfo, setUsersInfo] = useState<Record<string, UserInfo>>({})
	const acceptMutation = useAcceptTeamJoinRequest()
	const rejectMutation = useRejectTeamJoinRequest()
	const router = useRouter()

	useEffect(() => {
		const fetchUsersInfo = async () => {
			if (!requests) return

			const userInfoPromises = requests.map(async (request) => {
				// getUserById already returns an object with userId
				const userInfo = await getUserById(request.userId)
				if (userInfo) {
					return userInfo
				}
				return null
			})

			const usersInfoArray = (await Promise.all(userInfoPromises)).filter(Boolean) as UserInfo[]

			const usersInfoMap = usersInfoArray.reduce(
				(acc, userInfo) => {
					if (userInfo) {
						acc[userInfo.userId] = userInfo
					}
					return acc
				},
				{} as Record<string, UserInfo>
			)

			setUsersInfo(usersInfoMap)
		}

		fetchUsersInfo()
	}, [requests])

	const handleAccept = (requestId: string, userName: string) => {
		acceptMutation.mutate(requestId, {
			onSuccess: () => {
				// Show success message
				toast.success(`${userName}'s join request accepted`)

				// Redirect to the teams page with refresh parameter
				router.push(`${ROUTE.TEAMS}?refresh=true&t=${Date.now()}`)
			},
			onError: (error) => {
				toast.error(
					`Failed to accept join request: ${error instanceof Error ? error.message : "Unknown error"}`
				)
			},
		})
	}

	const handleReject = (requestId: string, userName: string) => {
		rejectMutation.mutate(requestId, {
			onSuccess: () => {
				toast.success(`${userName}'s join request rejected`)
			},
			onError: (error) => {
				toast.error(
					`Failed to reject join request: ${error instanceof Error ? error.message : "Unknown error"}`
				)
			},
		})
	}

	if (isLoading) {
		return <div className="py-4 text-center">Loading join requests...</div>
	}

	if (!requests || requests.length === 0) {
		return null
	}

	return (
		<div className="bg-white shadow mb-6 p-6 rounded-lg">
			<h2 className="mb-4 font-semibold text-xl">Join Requests</h2>
			<div className="space-y-4">
				{requests.map((request) => {
					const userInfo = usersInfo[request.userId]

					return (
						<div
							key={request.id}
							className="flex justify-between items-center hover:bg-gray-50 p-3 border rounded"
						>
							<div className="flex items-center">
								<Avatar className="mr-3">
									<AvatarImage src={userInfo?.userAvatarUrl} />
									<AvatarFallback>
										{userInfo?.userName ? userInfo.userName[0].toUpperCase() : "?"}
									</AvatarFallback>
								</Avatar>
								<div>
									<p className="font-medium">{userInfo?.userName || "Loading..."}</p>
									<p className="text-gray-500 text-sm">
										Requested {new Date(request.createdAt).toLocaleDateString()}
									</p>
								</div>
							</div>

							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleReject(request.id, userInfo?.userName || "User")}
									disabled={rejectMutation.isPending}
								>
									Reject
								</Button>
								<Button
									size="sm"
									onClick={() => handleAccept(request.id, userInfo?.userName || "User")}
									disabled={acceptMutation.isPending}
								>
									Accept
								</Button>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
