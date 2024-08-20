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
import { Button } from "@components/atoms/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@components/atoms/dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@components/atoms/dropdown-menu"
import { Textarea } from "@components/atoms/textarea"
import { createReportedPost } from "@prisma/functions/post/report"
import { createSavedPost } from "@prisma/functions/post/saved"
import {
	BookMarked,
	Copy,
	Ellipsis,
	FlagTriangleRight,
	UserMinus,
} from "lucide-react"
import React from "react"

export type PostSaveProps = {
	userId: string
	postId: number
}

export type PostReportProps = {
	userId: string
	postId: number
	content: string
}

const dropdownMenuItemClassName = "cursor-pointer hover:bg-background-item"

export default function PostDropdownMenu({ userId, postId }: PostSaveProps) {
	// Dropdown menu
	const [isDropdownOpen, setOpenDropdown] = React.useState<boolean>(false)
	// Report dialog
	const [isReportDialogOpen, setOpenReportDialog] =
		React.useState<boolean>(false)
	// Report content
	const [reportContent, setReportContent] = React.useState<string>("")
	// Alert dialog for discarding report
	const [alertIsOpen, setOpenAlert] = React.useState<boolean>(false)

	// Handles saving the post
	const handleSavePost = async () => {
		await createSavedPost({ userId, postId })
	}

	// Handles unfollowing the poster
	const handleUnfollow = () => {}

	// REPORT
	// ------------------------
	// The limit of characters for the report content
	const charsLimit = 200

	// Handles the alert dialog to discard comment
	const handleOpenAlert = () => {
		// If the value is not empty, open the alert
		if (reportContent.length > 0) {
			setOpenAlert(true)
		}
	}

	// Handles discarding the report
	const handleReportDiscard = () => {
		setReportContent("")
	}

	// Handles submitting the report
	const handleReportSubmit = async () => {
		await createReportedPost({ userId, postId, content: reportContent })
		// Reset the report
		setReportContent("")
		// Close the report dialog
		setOpenReportDialog(false)
		// TODO: show success message
	}
	// ------------------------

	// Handles copying the post link
	const handleCopyPostLink = () => {}

	return (
		<>
			<DropdownMenu open={isDropdownOpen} onOpenChange={setOpenDropdown}>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost">
						<Ellipsis />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					{/* save */}
					<DropdownMenuItem asChild className={dropdownMenuItemClassName}>
						<Button
							variant="ghost"
							className="w-full flex-between"
							onClick={handleSavePost}
						>
							<p>Save</p>
							<BookMarked />
						</Button>
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					{/* unfollow */}
					<DropdownMenuItem asChild className={dropdownMenuItemClassName}>
						<Button
							variant="ghost"
							className="w-full flex-between"
							onClick={handleUnfollow}
						>
							<p>Unfollow</p>
							<UserMinus />
						</Button>
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					{/* report */}
					<DropdownMenuItem asChild className={dropdownMenuItemClassName}>
						<Button
							variant="ghost"
							className="w-full flex-between"
							onClick={() => setOpenReportDialog(true)}
						>
							<p>Report</p>
							<FlagTriangleRight />
						</Button>
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					{/* copy link */}
					<DropdownMenuItem asChild className={dropdownMenuItemClassName}>
						<Button
							variant="ghost"
							className="w-full flex-between"
							onClick={handleCopyPostLink}
						>
							<p>Copy link</p>
							<Copy />
						</Button>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* report dialog */}
			<Dialog open={isReportDialogOpen} onOpenChange={setOpenReportDialog}>
				<DialogContent
					className="rounded-lg border-none"
					onPointerDownOutside={handleOpenAlert}
				>
					<DialogHeader>
						<DialogTitle>Report</DialogTitle>
						<DialogDescription>
							Why are you reporting this post ?
						</DialogDescription>

						<Textarea
							value={reportContent}
							onChange={(e) => setReportContent(e.target.value)}
						/>
					</DialogHeader>

					{/* report button */}
					<Button
						onClick={handleReportSubmit}
						// if charsLimit is reached or value is empty -> disable
						disabled={
							reportContent.length > charsLimit || reportContent.length === 0
						}
					>
						Reply
					</Button>
				</DialogContent>
			</Dialog>

			{/* show when report content is not empty */}
			<AlertDialog open={alertIsOpen} onOpenChange={setOpenAlert}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Discard report ?</AlertDialogTitle>
						<AlertDialogDescription />
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setOpenReportDialog(true)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction onClick={handleReportDiscard}>
							Discard
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
