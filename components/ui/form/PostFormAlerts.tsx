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

interface PostFormAlertsProps {
	snippetDiscardAlert: boolean
	setAlertSnippetDiscard: (value: boolean) => void
	postDiscardAlert: boolean
	setAlertPostDiscard: (value: boolean) => void
	setOpenDrawer: (value: boolean) => void
	handleSnippetDiscard: () => void
	handlePostDiscard: () => void
}

export function PostFormAlerts({
	snippetDiscardAlert,
	setAlertSnippetDiscard,
	postDiscardAlert,
	setAlertPostDiscard,
	setOpenDrawer,
	handleSnippetDiscard,
	handlePostDiscard,
}: PostFormAlertsProps) {
	return (
		<>
			<AlertDialog
				open={snippetDiscardAlert}
				onOpenChange={setAlertSnippetDiscard}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Discard code snippet ?</AlertDialogTitle>
						<AlertDialogDescription />
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setOpenDrawer(true)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction onClick={handleSnippetDiscard}>
							Discard
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={postDiscardAlert} onOpenChange={setAlertPostDiscard}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Discard post ?</AlertDialogTitle>
						<AlertDialogDescription />
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setOpenDrawer(true)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction onClick={handlePostDiscard}>
							Discard
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
