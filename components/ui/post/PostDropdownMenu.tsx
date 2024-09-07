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
} from "@components/ui/AlertDialog"
import { Button } from "@components/ui/Button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@components/ui/Dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@components/ui/DropdownMenu"
import { Textarea } from "@components/ui/Textarea"
import { createReportedPost } from "@queries/server/report"
import { createSavedPost } from "@queries/server/saved"
import { useCopyToClipboard } from "@uidotdev/usehooks"
import { BookMarked, Copy, Ellipsis, FlagTriangleRight } from "lucide-react"
import React from "react"

export type PostSaveProps = {
	userId: string
	postId: string
}

export type PostReportProps = {
	userId: string
	postId: string
	content: string
}

export type PostCopyLinkProps = {
	userName: string | null
}

const dropdownMenuItemClassName = "cursor-pointer hover:bg-background-item"

export default function PostDropdownMenu({
	userId,
	postId,
	userName,
	content,
}: PostSaveProps & PostReportProps & PostCopyLinkProps) {
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

	const [copiedText, copyToClipboard] = useCopyToClipboard()

	const postLink = `${userName}/post/${postId}`

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
							onClick={() => copyToClipboard(postLink)}
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
