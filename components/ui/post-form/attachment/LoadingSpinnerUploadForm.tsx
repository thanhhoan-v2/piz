import { LoaderIcon } from "lucide-react"

export default function LoadingSpinnerUploadForm() {
	return (
		<>
			<div className="animate-spin">
				<LoaderIcon size={18} />
			</div>
			<p>&nbsp;Uploading...</p>
		</>
	)
}
