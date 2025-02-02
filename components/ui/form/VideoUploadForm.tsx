"use client"

import { Button } from "@components/ui/Button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@components/ui/Card"
import { Input } from "@components/ui/Input"
import VideoPlayer from "@components/ui/form/VideoPlayer"
import { createSupabaseBrowserClient } from "@utils/supabase/client"
import { X } from "lucide-react"
import type { ChangeEvent } from "react"
import { Suspense } from "react"
import { useState } from "react"

const supabaseStoragePrefixURL =
	"https://gqbxsozrrjnfbqqctqji.supabase.co/storage/v1/object/public/media_files//"

export default function VideoUploadForm({
	setIsAddingVideo,
}: { setIsAddingVideo: (isAddingVideo: boolean) => void }) {
	const [uploadedVideoPath, setUploadedVideoPath] = useState<string | null>()
	const [uploading, setUploading] = useState(false)

	const supabase = createSupabaseBrowserClient()

	// useEffect(() => {
	// 	if (url) downloadImage(url)
	// }, [url])

	// async function downloadImage(path) {
	// 	try {
	// 		const { data, error } = await supabase.storage
	// 			.from("media_files")
	// 			.download(path)
	// 		if (error) {
	// 			throw error
	// 		}
	// 		const url = URL.createObjectURL(data)
	// 	} catch (error) {
	// 		console.log("Error downloading image: ", error.message)
	// 	}
	// }

	const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
		setUploading(true)

		try {
			if (!event?.target.files || event.target.files.length === 0) {
				throw new Error("You must select an image to upload.")
			}

			const file = event.target.files[0]
			const fileExtension = file.name.split(".").pop()
			const fileName = `${Math.random()}.${fileExtension}`
			const filePath = `${fileName}`

			const { data, error: uploadError } = await supabase.storage
				.from("media_files")
				.upload(filePath, file)

			if (uploadError) {
				throw uploadError
			}

			if (data) {
				setUploadedVideoPath(data.path)
			}
		} catch (error) {
			console.error("Error uploading file:", error)
		} finally {
			setUploading(false)
		}
	}

	return (
		<Card className="w-full max-w-lg">
			<CardHeader>
				<CardTitle className="flex-between">
					<p>Upload video</p>
					<Button
						variant="ghost"
						onClick={() => {
							setUploadedVideoPath(null)
							setUploading(false)
							setIsAddingVideo(false)
						}}
					>
						<X />
					</Button>
				</CardTitle>
				<CardDescription>
					Drop a video or click to select a file.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{uploadedVideoPath ? (
					<div className="space-y-2">
						<Suspense fallback={<p>Loading...</p>}>
							<VideoPlayer src={supabaseStoragePrefixURL + uploadedVideoPath} />
						</Suspense>
					</div>
				) : (
					<div className="flex h-48 items-center justify-center rounded-md border-2 border-muted-foreground border-dashed p-6 text-center">
						<div className="space-y-2">
							<Input
								accept="video/*"
								type="file"
								id="file-input"
								className="hidden"
								onChange={handleUpload}
								disabled={uploading === true}
							/>
							<label
								htmlFor="file-input"
								className="inline-flex h-full cursor-pointer items-center justify-center self-center rounded-md border border-gray-200 bg-white px-4 py-2 font-medium text-sm shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:focus-visible:ring-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50"
							>
								{uploading ? "Loading..." : "Select a video"}
							</label>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
