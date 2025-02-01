import { useToast } from "@components/ui/toast/useToast"
import { AppwriteID, appwriteClient } from "@queries/appwrite"
import { Storage } from "appwrite"
import { useCallback, useEffect, useRef, useState } from "react"

interface UseImageUploadProps {
	onUpload?: (url: string) => void
}

export function useImageUpload({ onUpload }: UseImageUploadProps = {}) {
	const previewRef = useRef<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	const [fileName, setFileName] = useState<string | null>(null)
	const [uploadedFileID, setUploadedFileID] = useState<string | null>(null)
	const [uploadedFileURL, setUploadedFileURL] = useState<string>()
	const [fileType, setFileType] = useState<string>("image")
	const [bucketID, setBucketID] = useState<string>("")

	const appwriteStorage = new Storage(appwriteClient)
	const appwriteBucketID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID

	useEffect(() => {
		if (appwriteBucketID) {
			setBucketID(bucketID)
		}
	})

	const handleThumbnailClick = useCallback(() => {
		fileInputRef.current?.click()
	}, [])

	const { toast } = useToast()

	const handleFileChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0]

			if (file) {
				if (file.type.startsWith("video/")) setFileType("video")
				setFileName(file.name)
				const url = URL.createObjectURL(file)
				setPreviewUrl(url)
				previewRef.current = url
				onUpload?.(url)

				try {
					const uploadedFile = appwriteStorage.createFile(
						bucketID,
						AppwriteID.unique(),
						file,
					)

					uploadedFile.then(
						(response) => {
							setUploadedFileID(response.$id)
							if (file.type.startsWith("video/")) {
								const videoURL = appwriteStorage.getFileView(
									bucketID,
									response.$id,
								)
								setUploadedFileURL(videoURL.toString())
							}
						},
						(error) => {
							console.log(error)
						},
					)
				} catch (error) {
					console.error("Error uploading file:", error)
				}
			}
		},
		[onUpload],
	)

	const handleRemove = useCallback(() => {
		console.log(uploadedFileID)
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl)
		}
		setPreviewUrl(null)
		setFileName(null)
		previewRef.current = null
		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}

		if (bucketID && uploadedFileID) {
			appwriteStorage.deleteFile(bucketID, uploadedFileID || "")
		}
	}, [previewUrl, uploadedFileID])

	const getUploadedFileID = () => uploadedFileID
	const getUploadedFileType = () => fileType
	const getUploadedFileURL = () => uploadedFileURL

	useEffect(() => {
		return () => {
			if (previewRef.current) {
				URL.revokeObjectURL(previewRef.current)
			}
		}
	}, [])

	return {
		previewUrl,
		fileName,
		fileInputRef,
		handleThumbnailClick,
		handleFileChange,
		handleRemove,
		getUploadedFileID,
		getUploadedFileType,
		getUploadedFileURL,
	}
}
