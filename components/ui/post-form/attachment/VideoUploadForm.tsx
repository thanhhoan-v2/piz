"use client"

import { Button } from "@components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/Card"
import { Input } from "@components/ui/Input"
import { createSupabaseBrowserClient } from "@utils/supabase/client"
import { SUPABASE_STORAGE_PREFIX_URL } from "@utils/supabase/storage"
import { X } from "lucide-react"
import type { ChangeEvent } from "react"
import { Suspense, useEffect, useState } from "react"
import LoadingSpinnerUploadForm from "./LoadingSpinnerUploadForm"
import VideoPlayer from "./VideoPlayer"

export function VideoUploadForm({
	setIsAddingVideo,
	onVideoUpload,
	onVideoRemove,
}: {
	setIsAddingVideo: (isAddingVideo: boolean) => void
	onVideoUpload: (url: string) => void
	onVideoRemove: () => void
}) {
	// "https://gqbxsozrrjnfbqqctqji.supabase.co/storage/v1/object/public/media_files//video.png"
	const [uploadedVideoPath, setUploadedVideoPath] = useState<string | null>()
	// "media_files/video.png"
	const [uploadedVideoBucket, setUploadedVideoBucketFolder] = useState<string | null>()
	const [uploading, setUploading] = useState(false)

	const supabase = createSupabaseBrowserClient()

	useEffect(() => {
		const storedPostVideoUrl = localStorage.getItem("postVideoUrl")
		if (storedPostVideoUrl) setUploadedVideoPath(storedPostVideoUrl)
	}, [])

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

			const urlPath = SUPABASE_STORAGE_PREFIX_URL + data.path

			if (data) {
				setUploadedVideoPath(urlPath)
				setUploadedVideoBucketFolder(data.path)
				onVideoUpload(urlPath)
				localStorage.setItem("postVideoUrl", urlPath)
			}
		} catch (error) {
			console.error("Error uploading file:", error)
		} finally {
			setUploading(false)
		}
	}

	const handleRemoveVideo = async () => {
		if (uploadedVideoBucket) {
			await supabase.storage.from("media_files").remove([uploadedVideoBucket])
		}

		setUploadedVideoPath(null)
		setUploading(false)
		setIsAddingVideo(false)
		onVideoRemove()
		localStorage.removeItem("postVideoUrl")
	}

	return (
		<Card className="w-full max-w-lg">
			<CardHeader>
				<CardTitle className="flex-between">
					<p>Upload video</p>
					<Button variant="ghost" onClick={handleRemoveVideo}>
						<X />
					</Button>
				</CardTitle>
				<CardDescription>Drop a video or click to select a file.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{uploadedVideoPath ? (
					<div className="space-y-2">
						<Suspense fallback={<p>Loading...</p>}>
							<VideoPlayer src={uploadedVideoPath} />
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
								{uploading ? <LoadingSpinnerUploadForm /> : "Select a video"}
							</label>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
