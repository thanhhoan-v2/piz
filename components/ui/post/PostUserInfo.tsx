"use client"

import { getUserById } from "@app/actions/user"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/Avatar"
import { Button } from "@components/ui/Button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@components/ui/Dialog"
import { useDeletePostMutation } from "@queries/client/post"
import { getFollow } from "@queries/server/follow"
import { useUser } from "@stackframe/stack"
import { useQuery } from "@tanstack/react-query"
import { avatarPlaceholder } from "@utils/image.helpers"
import { queryKey } from "@utils/queryKeyFactory"
import { firstLetterToUpper } from "@utils/string.helpers"
import { formatDistanceToNow } from "date-fns"
import { Loader2, Users, XIcon } from "lucide-react"
import type { Route } from "next"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Badge } from "../Badge"
import PostContent from "./PostContent"

type PostUserInfoProps = {
	userName?: string | null
	userAvatarUrl?: string | null
	userId?: string
	visibility?: string
	createdAt: Date
	updatedAt: Date | null
	appUserName?: string | null
	// PostContent's
	content: string
	postImageUrl: string | null
	postVideoUrl: string | null
	snippetId: string | null
	postId: string
	teamId?: string | null
}

type DeletePostButtonProps = {
	postId: string
	userId: string
}

function DeletePostButton({ postId, userId }: DeletePostButtonProps) {
	const [open, setOpen] = useState(false)
	const deletePostMutation = useDeletePostMutation()
	const [isDeleting, setIsDeleting] = useState(false)

	const handleDeletePost = () => {
		setIsDeleting(true)
		console.log(postId, userId)
		deletePostMutation.mutate(
			{ postId, userId },
			{
				onSettled: () => {
					setIsDeleting(false)
					setOpen(false) // Close dialog after completion
				},
			},
		)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="hover:bg-transparent text-muted-foreground hover:text-destructive"
				>
					<XIcon size={16} />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Post</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete this post? This action cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button variant="destructive" onClick={handleDeletePost} disabled={isDeleting}>
						{isDeleting ? "Deleting..." : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export default function PostUserInfo({
	userId,
	visibility,
	createdAt,
	content,
	postImageUrl,
	postVideoUrl,
	snippetId,
	postId,
	teamId,
}: PostUserInfoProps) {
	const user = useUser()

	// State to store team information
	const [teamName, setTeamName] = useState<string | null>(null)
	const [isTeamMember, setIsTeamMember] = useState<boolean>(false)
	const [isTeamPublic, setIsTeamPublic] = useState<boolean>(false)
	const [isJoiningTeam, setIsJoiningTeam] = useState<boolean>(false)

	// Fetch team information if this is a team post
	useEffect(() => {
		const fetchTeamInfo = async () => {
			if (teamId) {
				try {
					// Fetch team information from the API
					const response = await fetch(`/api/team/${teamId}/info`)
					if (response.ok) {
						const teamData = await response.json()
						console.log(teamData)
						setTeamName(teamData.displayName)
						setIsTeamMember(teamData.isMember)
						setIsTeamPublic(teamData.isPublic)
						console.log("Fetched team info:", teamData)
					} else {
						console.log("Failed to fetch team info")
					}
				} catch (error) {
					console.error("Error fetching team info:", error)
				}
			}
		}

		fetchTeamInfo()
	}, [teamId])

	// Function to fetch team information
	const fetchTeamInfo = async () => {
		if (teamId) {
			try {
				// Add cache busting to ensure we get fresh data
				const response = await fetch(`/api/team/${teamId}/info?t=${Date.now()}`, {
					headers: {
						"Cache-Control": "no-cache, no-store, must-revalidate",
						Pragma: "no-cache",
						Expires: "0",
					},
				})
				if (response.ok) {
					const teamData = await response.json()
					setTeamName(teamData.displayName)
					setIsTeamMember(teamData.isMember)
					setIsTeamPublic(teamData.isPublic)
					console.log("Fetched team info:", teamData)
				} else {
					console.log("Failed to fetch team info")
				}
			} catch (error) {
				console.error("Error fetching team info:", error)
			}
		}
	}

	// Fetch team information if this is a team post
	useEffect(() => {
		fetchTeamInfo()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [teamId])

	// Function to join a team
	const joinTeam = async () => {
		if (!teamId || !user || isJoiningTeam) return

		try {
			setIsJoiningTeam(true)
			console.log("Joining team:", teamId, "User:", user.id)

			// Call the API to join the team
			const response = await fetch("/api/team/join", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					teamId: teamId,
					userId: user.id,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || "Failed to join team")
			}

			// Show success message
			toast.success(`You have joined ${teamName || "the team"}`)
			console.log("Successfully joined team")

			// Update state to reflect membership
			setIsTeamMember(true)

			// Refresh team information to ensure UI is updated
			setTimeout(() => {
				fetchTeamInfo()

				// Show a toast with navigation option
				toast.success("Go to team page", {
					action: {
						label: "View Team",
						onClick: () => {
							// Navigate to team page with refresh parameter
							window.location.href = `/team/${teamId}?refresh=true&t=${Date.now()}`
						},
					},
				})
			}, 500)
		} catch (error) {
			console.error("Error joining team:", error)
			toast.error(error instanceof Error ? error.message : "Failed to join team")
		} finally {
			setIsJoiningTeam(false)
		}
	}

	const [posterInfo, setPosterInfo] = useState<{
		userName: string
		userAvatarUrl: string
		userId: string
	}>()

	useEffect(() => {
		const fetchUserInfo = async () => {
			const userInfo = await getUserById(userId)
			setPosterInfo(userInfo)
		}
		fetchUserInfo()
	}, [userId])

	// Get if I'm following them
	const { data: followData } = useQuery({
		queryKey: queryKey.follow.selectFollower(user?.id ?? ""),
		queryFn: () =>
			getFollow({
				followerId: user?.id ?? "",
				followeeId: userId ?? "",
			}),
		enabled: !!user?.id && !!userId && user?.id !== userId,
	})

	// Get if they're following me
	const { data: followsMe } = useQuery({
		queryKey: queryKey.follow.selectFollower(userId ?? ""),
		queryFn: () =>
			getFollow({
				followerId: userId ?? "",
				followeeId: user?.id ?? "",
			}),
		enabled: !!user?.id && !!userId && user?.id !== userId,
	})

	const getFollowStatus = () => {
		// Don't show status if it's the user's own post
		if (userId === user?.id) return null

		// Don't show status for certain visibility settings
		if (visibility === "PRIVATE" || visibility === "ME_ONLY") return null

		// // If both users follow each other, only show "Following"
		// if (
		// 	followData?.requestStatus === "ACCEPTED" &&
		// 	followsMe?.requestStatus === "ACCEPTED"
		// ) {
		// 	return <span className="text-muted-foreground text-sm">Following</span>
		// }
		//
		// // If only they follow me, show "Follows you"
		// if (followsMe?.requestStatus === "ACCEPTED") {
		// 	return <span className="text-muted-foreground text-sm">Follows you</span>
		// }
		//
		// // If only I follow them, show "Following" or "Requested"
		// if (followData?.requestStatus === "ACCEPTED") {
		// 	return <span className="text-muted-foreground text-sm">Following</span>
		// }
		// if (followData?.requestStatus === "PENDING") {
		// 	return <span className="text-muted-foreground text-sm">Requested</span> }

		return null
	}

	return (
		<>
			<div className="flex-col gap-4 w-full">
				<div className="flex-between w-full text-white">
					{/* Left side */}
					<div className="flex-y-center gap-3">
						{/* Avatar */}
						<Link href={`/${userId}` as Route}>
							<Avatar>
								<AvatarImage
									src={
										posterInfo?.userAvatarUrl === "" ? avatarPlaceholder : posterInfo?.userAvatarUrl
									}
									alt={`${posterInfo?.userName}'s avatar`}
								/>
								<AvatarFallback>{firstLetterToUpper(posterInfo?.userName ?? "")}</AvatarFallback>
							</Avatar>
						</Link>

						<div>
							<div className="flex-y-center gap-2">
								{/* Username */}
								<Link href={`/${userId}` as Route}>
									<p className="font-bold hover:underline">
										{firstLetterToUpper(posterInfo?.userName ?? "")}
									</p>
								</Link>

								{/* Show team badge if it's a team post */}
								{teamId && (
									<div className="flex items-center gap-2">
										<Link
											href={
												isTeamMember
													? `/team/${teamId}`
													: (`/team/${teamId}?refresh=true&t=${Date.now()}` as Route)
											}
											className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full text-blue-600 text-sm"
											onClick={() => toast.info(`Navigating to ${teamName || "team"}...`)}
										>
											{teamName && (
												<Badge>
													<Users size={12} />
													&nbsp;
													{teamName}
												</Badge>
											)}
										</Link>

										{/* Show Join button if user is not a member and team is public */}
										{user && !isTeamMember && isTeamPublic && (
											<Button
												size="sm"
												variant="outline"
												className="py-0 h-6 text-xs"
												onClick={joinTeam}
												disabled={isJoiningTeam}
											>
												{isJoiningTeam ? (
													<>
														<Loader2 size={12} className="mr-1 animate-spin" />
														Joining...
													</>
												) : (
													"Join"
												)}
											</Button>
										)}
									</div>
								)}

								{/* (Posted) Time diff */}
								<p className="text-muted-foreground">
									{formatDistanceToNow(new Date(createdAt), {
										addSuffix: true,
									})}
								</p>
							</div>
							{/* Follow status */}
							<div>{getFollowStatus()}</div>
						</div>
					</div>
					{/* Right side */}
					<div>
						{/* Delete post button - only show if current user is the author */}
						{userId && userId === user?.id && <DeletePostButton postId={postId} userId={user.id} />}
					</div>
				</div>

				<PostContent
					content={content}
					postImageUrl={postImageUrl}
					postVideoUrl={postVideoUrl}
					snippetId={snippetId}
				/>
			</div>
		</>
	)
}
