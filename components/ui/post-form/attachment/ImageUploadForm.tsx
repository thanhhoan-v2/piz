"use client"

import { Button } from "@components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/Card"
import { Input } from "@components/ui/Input"
import { createSupabaseBrowserClient } from "@utils/supabase/client"
import { SUPABASE_STORAGE_PREFIX_URL } from "@utils/supabase/storage"
import { Camera, Check, Image as ImageIcon, Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import type { ChangeEvent } from "react"
import { Suspense, useEffect, useState } from "react"

export default function ImageUploadForm({
	setIsAddingImageAction,
	onImageUploadAction,
	onImageRemoveAction,
}: {
	setIsAddingImageAction: (isAddingImage: boolean) => void
	onImageUploadAction: (url: string) => void
	onImageRemoveAction: () => void
}) {
	// "https://gqbxsozrrjnfbqqctqji.supabase.co/storage/v1/object/public/media_files//image.png"
	const [uploadedImagePath, setUploadedImageUrl] = useState<string | null>()
	// "media_files/image.png"
	const [uploadedImageBucket, setUploadedImageBucketFolder] = useState<string | null>()
	const [uploading, setUploading] = useState(false)

	const supabase = createSupabaseBrowserClient()

	// biome-ignore lint/correctness/useExhaustiveDependencies: We only want to run this once on mount
	useEffect(() => {
		const storedPostImageUrl = localStorage.getItem("postImageUrl")
		if (storedPostImageUrl) {
			console.log("[IMAGE] Found stored image URL:", storedPostImageUrl)
			setUploadedImageUrl(storedPostImageUrl)

			// Get the bucket path from the URL
			const urlParts = storedPostImageUrl.split(SUPABASE_STORAGE_PREFIX_URL)
			if (urlParts.length > 1) {
				setUploadedImageBucketFolder(urlParts[1])
			}

			// Notify parent component
			onImageUploadAction(storedPostImageUrl)
		}
	}, [onImageUploadAction, SUPABASE_STORAGE_PREFIX_URL])

	const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
		setUploading(true)

		try {
			if (!event?.target.files || event.target.files.length === 0) {
				throw new Error("You must select an image to upload.")
			}

			const file = event.target.files[0]

			// Validate file type
			if (!file.type.startsWith("image/")) {
				throw new Error("Please select a valid image file.")
			}

			// Validate file size (10MB max)
			const MAX_SIZE = 10 * 1024 * 1024 // 10MB
			if (file.size > MAX_SIZE) {
				throw new Error("Image file is too large. Maximum size is 10MB.")
			}

			console.log("[IMAGE] Uploading image file:", {
				name: file.name,
				type: file.type,
				size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
			})

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
			console.log("[IMAGE] Image uploaded successfully:", urlPath)

			if (data) {
				setUploadedImageUrl(urlPath)
				setUploadedImageBucketFolder(data.path)
				onImageUploadAction(urlPath)
				localStorage.setItem("postImageUrl", urlPath)

				// We'll keep the loading state active until the image is fully loaded in the UI
				// The onLoad handler in the Image component will set uploading to false
			}
		} catch (error) {
			console.error("[IMAGE] Error uploading image file:", error)
			alert(error instanceof Error ? error.message : "Failed to upload image. Please try again.")
			setUploading(false)
		}
	}

	const handleRemoveImage = async () => {
		if (uploadedImageBucket) {
			await supabase.storage.from("media_files").remove([uploadedImageBucket])
		}

		setUploadedImageUrl(null)
		setUploading(false)
		setIsAddingImageAction(false)
		onImageRemoveAction()
		localStorage.removeItem("postImageUrl")
	}

	return (
		<Card className="shadow-md border-border w-full max-w-lg">
			<CardHeader className="pb-3">
				<CardTitle className="flex justify-between items-center">
					<div className="flex items-center gap-2">
						<div className="bg-primary/10 p-2 rounded-md">
							<ImageIcon className="w-5 h-5 text-primary" />
						</div>
						<p>Image Upload</p>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="hover:bg-destructive/10 rounded-full hover:text-destructive"
						onClick={handleRemoveImage}
					>
						<X className="w-5 h-5" />
					</Button>
				</CardTitle>
				<CardDescription className="flex items-center gap-1 text-muted-foreground">
					<Camera className="w-3 h-3" />
					Share your moments with high-quality images
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4 pt-0">
				{uploadedImagePath ? (
					<div className="space-y-4">
						<div className="relative shadow-sm border border-border rounded-lg overflow-hidden">
							<div className="top-2 right-2 absolute flex items-center gap-1 bg-black/60 px-2 py-1 rounded-md text-white text-xs">
								<Check className="w-3 h-3" /> Uploaded
							</div>
							<Suspense
								fallback={
									<div className="flex justify-center items-center bg-gray-100 dark:bg-gray-800 h-[300px] animate-pulse">
										<Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
									</div>
								}
							>
								<div className="relative bg-muted w-full aspect-video overflow-hidden">
									<Image
										fill
										src={uploadedImagePath}
										alt="Uploaded Image"
										className="object-cover hover:scale-105 transition-all"
										onLoad={() => {
											console.log("[IMAGE] Image loaded in upload form")
											setUploading(false)
										}}
										onError={() => {
											console.error("[IMAGE] Error loading image in upload form")
											setUploading(false)
										}}
									/>
								</div>
							</Suspense>
						</div>
						<div className="flex justify-end">
							<Button
								variant="outline"
								size="sm"
								className="hover:bg-destructive/10 border-destructive/30 text-destructive"
								onClick={handleRemoveImage}
							>
								<X className="mr-1 w-4 h-4" /> Remove Image
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
								<p className="text-muted-foreground text-sm">Supports JPG, PNG, GIF up to 10MB</p>
							</div>
							<Input
								accept="image/*"
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
										<Camera className="w-4 h-4" />
										Select Image
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
