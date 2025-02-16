import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/AlertDialog";

interface PostFormAlertsProps {
  postDiscardAlert: boolean;
  setAlertPostDiscard: (value: boolean) => void;
  setOpenDrawer: (value: boolean) => void;
  handlePostDiscard: () => void;
}

export function PostFormAlerts({
  postDiscardAlert,
  setAlertPostDiscard,
  setOpenDrawer,
  handlePostDiscard,
}: PostFormAlertsProps) {
  return (
    <>
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
  );
}
