"use client"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@components/atoms/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@components/atoms/avatar"
import { Badge } from "@components/atoms/badge"
import { Button } from "@components/atoms/button"
import { Dialog, DialogContent } from "@components/atoms/dialog"
import { Textarea } from "@components/atoms/textarea"
import { ROUTE } from "@constants/route"
import { createPostComment } from "@prisma/functions/comment"
import { cn } from "@utils/cn"
import {
	CircleUser,
	HashIcon,
	ImageIcon,
	MenuIcon,
	MessageSquare,
} from "lucide-react"
import type { Route } from "next"
import Link from "next/link"
import React from "react"

type PostCommentButtonProps = {
	initialCommentCount: number
	className?: string
	// user related
	userId: string
	userAvatarUrl: string | null
	userName: string | null
	// post related
	postId: number
	postContent: string
	postTimeDiff: string
	postVisibility: string | null
}

export default function PostCommentButton({
	className,
	initialCommentCount,
	// user related
	userId,
	userAvatarUrl,
	userName,
	// post related
	postId,
	postContent,
	postTimeDiff,
	postVisibility,
}: PostCommentButtonProps) {
	/*
	 * The useTransition hook is a part of React's concurrent features.
	 * It allows you to mark updates as "transitions," which means they can be interrupted by more urgent updates.
	 * This is particularly useful for improving the user experience by keeping the UI responsive during longer-running updates.
	 */
	const [isPending, startTransition] = React.useTransition()

	// Modal for creating a new comment
	const [modalIsOpen, setOpenModal] = React.useState<boolean>(false)
	// Alert dialog for discarding comment
	const [alertIsOpen, setOpenAlert] = React.useState<boolean>(false)
	// User input value
	const [value, setValue] = React.useState("")
	// Reference to the textarea element
	const textareaRef = React.useRef<HTMLTextAreaElement>(null)
	// Comment count
	const [commentCount, setCommentCount] =
		React.useState<number>(initialCommentCount)

	// Handles opening the modal
	const handleClick = () => {
		setOpenModal(!modalIsOpen)
	}

	// Comment characters limit
	const charsLimit = 550

	// Handles value change in the textarea
	const handleChange = React.useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setValue(e.target.value)
		},
		[],
	)

	// Handles the alert dialog to discard comment
	const handleOpenAlert = () => {
		// If the value is not empty, open the alert
		if (value.length > 0) {
			setOpenAlert(true)
		}
	}

	// Handles submitting the comment
	const handleSubmit = async () => {
		await createPostComment(postId, userId, value)

		// Close the modal
		setOpenModal(false)
		// Reset the value
		setValue("")
		// Increment the comment count
		setCommentCount(commentCount + 1)
	}

	// Handles discarding the comment
	const handleDiscard = () => {
		setValue("")
	}

	// Textarea auto increases its height on value length
	// biome-ignore lint/correctness/useExhaustiveDependencies: value is only needed here
	React.useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto"
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
		}
	}, [value])

	return (
		<>
			<Button
				variant="ghost"
				className={cn(className, "max-w-[100px]")}
				onClick={handleClick}
			>
				<MessageSquare />
				<span>{commentCount}</span>
			</Button>

			<Dialog open={modalIsOpen} onOpenChange={setOpenModal}>
				<DialogContent
					className="flex-col rounded-lg border-0"
					onPointerDownOutside={handleOpenAlert}
				>
					{/* post */}
					<div className="flex items-start gap-3">
						{userAvatarUrl ? (
							<Avatar className="h-12 w-12">
								<AvatarImage src={userAvatarUrl ?? ""} alt="User Avatar" />
								<AvatarFallback>PIZ</AvatarFallback>
							</Avatar>
						) : (
							<CircleUser />
						)}

						<div className="flex flex-col gap-2">
							<div>
								<div className="flex-y-center gap-4">
									<Link
										href={cn(ROUTE.HOME, userName) as Route}
										className="font-bold hover:underline hover:decoration-wavy hover:underline-offset-2"
									>
										{userName}
									</Link>
									<p className="text-slate-500 text-sm">{postTimeDiff}</p>
								</div>
								<Badge className="w-fit" variant="outline">
									{postVisibility}
								</Badge>
							</div>
							<div className="flex flex-col gap-4">
								<div className="whitespace-pre-wrap">{postContent}</div>
							</div>
						</div>
					</div>

					{/* form */}
					<div className="mb-8 w-full flex-start flex-col gap-2">
						<Textarea
							ref={textareaRef}
							value={value}
							onChange={handleChange}
							placeholder={cn("Reply to ", userName)}
							className=" min-h-[10px] resize-none border-none p-0 focus-visible:ring-0"
						/>
						<div className="flex space-x-4">
							<ImageIcon />
							<HashIcon />
							<MenuIcon />
						</div>
					</div>

					{/* post button */}
					<Button
						onClick={handleSubmit}
						disabled={value.length > charsLimit || value.length === 0}
					>
						Reply
					</Button>
				</DialogContent>
			</Dialog>

			<AlertDialog open={alertIsOpen} onOpenChange={setOpenAlert}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Discard comment ?</AlertDialogTitle>
						<AlertDialogDescription />
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setOpenModal(true)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction onClick={handleDiscard}>
							Discard
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
