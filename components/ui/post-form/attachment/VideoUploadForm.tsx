"use client"

import { Button } from "@components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/Card"
import { Input } from "@components/ui/Input"
import { createSupabaseBrowserClient } from "@utils/supabase/client"
import { SUPABASE_STORAGE_PREFIX_URL } from "@utils/supabase/storage"
import { Check, Film, Loader2, Upload, Video, X } from "lucide-react"
import type { ChangeEvent } from "react"
import { Suspense, useEffect, useState } from "react"
import VideoPlayer from "./VideoPlayer"

export function VideoUploadForm({
	setIsAddingVideoAction,
	onVideoUploadAction,
	onVideoRemoveAction,
}: {
	setIsAddingVideoAction: (isAddingVideo: boolean) => void
	onVideoUploadAction: (url: string) => void
	onVideoRemoveAction: () => void
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
				onVideoUploadAction(urlPath)
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
		setIsAddingVideoAction(false)
		onVideoRemoveAction()
		localStorage.removeItem("postVideoUrl")
	}

	return (
		<Card className="shadow-md border-border w-full max-w-lg">
			<CardHeader className="pb-3">
				<CardTitle className="flex justify-between items-center">
					<div className="flex items-center gap-2">
						<div className="bg-primary/10 p-2 rounded-md">
							<Film className="w-5 h-5 text-primary" />
						</div>
						<p>Video Upload</p>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="hover:bg-destructive/10 rounded-full hover:text-destructive"
						onClick={handleRemoveVideo}
					>
						<X className="w-5 h-5" />
					</Button>
				</CardTitle>
				<CardDescription className="flex items-center gap-1 text-muted-foreground">
					<Video className="w-3 h-3" />
					Share your videos with the community
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4 pt-0">
				{uploadedVideoPath ? (
					<div className="space-y-4">
						<div className="relative shadow-sm border border-border rounded-lg overflow-hidden">
							<div className="top-2 right-2 z-10 absolute flex items-center gap-1 bg-black/60 px-2 py-1 rounded-md text-white text-xs">
								<Check className="w-3 h-3" /> Uploaded
							</div>
							<Suspense
								fallback={
									<div className="flex justify-center items-center bg-gray-100 dark:bg-gray-800 h-[300px] animate-pulse">
										<Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
									</div>
								}
							>
								<div className="relative bg-muted rounded-md overflow-hidden">
									<VideoPlayer src={uploadedVideoPath} />
								</div>
							</Suspense>
						</div>
						<div className="flex justify-end">
							<Button
								variant="outline"
								size="sm"
								className="hover:bg-destructive/10 border-destructive/30 text-destructive"
								onClick={handleRemoveVideo}
							>
								<X className="mr-1 w-4 h-4" /> Remove Video
							</Button>
						</div>
					</div>
				) : (
					<div className="flex flex-col justify-center items-center bg-primary/5 hover:bg-primary/10 p-8 border-2 border-primary/20 border-dashed rounded-lg h-60 text-center transition-colors">
						<div className="flex flex-col items-center space-y-4">
							<div className="bg-background p-4 border border-border rounded-full">
								<Upload className="w-8 h-8 text-primary" />
							</div>
							<div className="space-y-2">
								<h3 className="font-medium">Drag & drop or click to upload</h3>
								<p className="text-muted-foreground text-sm">Supports MP4, WebM, MOV up to 100MB</p>
							</div>
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
								className="inline-flex justify-center items-center gap-2 bg-primary hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-primary-foreground text-sm transition-colors cursor-pointer disabled:pointer-events-none"
							>
								{uploading ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										Uploading...
									</>
								) : (
									<>
										<Film className="w-4 h-4" />
										Select Video
									</>
								)}
							</label>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
