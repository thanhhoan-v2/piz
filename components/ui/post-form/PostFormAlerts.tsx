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
import { AlertCircle } from "lucide-react"

interface PostFormAlertsProps {
	postDiscardAlert: boolean
	setAlertPostDiscard: (value: boolean) => void
	setOpenDrawer: (value: boolean) => void
	handlePostDiscard: () => void
	hasContent: boolean
}

export function PostFormAlerts({
	postDiscardAlert,
	setAlertPostDiscard,
	setOpenDrawer,
	handlePostDiscard,
	hasContent,
}: PostFormAlertsProps) {
	return (
		<>
			<AlertDialog open={postDiscardAlert} onOpenChange={setAlertPostDiscard}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<AlertCircle className="w-5 h-5 text-amber-500" />
							Discard unsaved content?
						</AlertDialogTitle>
						<AlertDialogDescription>
							{hasContent
								? "You have unsaved content in your post. Are you sure you want to discard your changes?"
								: "Are you sure you want to discard this post?"}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setOpenDrawer(true)}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handlePostDiscard}
							className="bg-destructive hover:bg-destructive/90"
						>
							Discard Changes
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
