import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { useImageUpload } from "@components/ui/form/useImageUpload"
import { cn } from "@utils/cn"
import { ImagePlus, Trash2, Upload, X } from "lucide-react"
import Video from "next-video"
import Image from "next/image"
import { useCallback, useState } from "react"

export function MediaUploadForm({
	setIsAddMedia,
}: { setIsAddMedia: (value: boolean) => void }) {
	const {
		previewUrl,
		fileInputRef,
		handleThumbnailClick,
		handleFileChange,
		handleRemove,
		getUploadedFileURL,
		getUploadedFileType,
	} = useImageUpload({
		onUpload: (url) => console.log("Uploaded image URL:", url),
	})

	const [isDragging, setIsDragging] = useState(false)

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
	}

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(true)
	}

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(false)
	}

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault()
			e.stopPropagation()
			setIsDragging(false)

			const file = e.dataTransfer.files?.[0]
			const fakeEvent = {
				target: { files: [file] },
			} as unknown as React.ChangeEvent<HTMLInputElement>
			handleFileChange(fakeEvent)
		},
		[handleFileChange],
	)

	return (
		<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
			<div className="mb-3 w-full flex-between">
				<div />{" "}
				<Button
					variant="outline"
					className="h-10 w-10 rounded-full p-0"
					onClick={() => {
						handleRemove()
						setIsAddMedia(false)
					}}
				>
					<X />
				</Button>
			</div>

			{!previewUrl && (
				<div className="space-y-8">
					<div>
						<h3 className="font-medium text-lg">Image Upload</h3>
						<p className="text-muted-foreground text-sm">
							Supported all images and videos format
						</p>
					</div>
				</div>
			)}

			<Input
				// accept="image/*"
				type="file"
				className="hidden"
				ref={fileInputRef}
				onChange={handleFileChange}
			/>

			{!previewUrl ? (
				<div
					onClick={handleThumbnailClick}
					onDragOver={handleDragOver}
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					className={cn(
						"flex h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-muted-foreground/25 border-dashed bg-muted/50 transition-colors hover:bg-muted",
						isDragging && "border-primary/50 bg-primary/5",
					)}
				>
					<div className="rounded-full bg-background p-3 shadow-sm">
						<ImagePlus className="h-6 w-6 text-muted-foreground" />
					</div>
					<div className="text-center">
						<p className="font-medium text-sm">Click to select</p>
						<p className="text-muted-foreground text-xs">
							or drag and drop file here
						</p>
					</div>
				</div>
			) : (
				<div className="relative">
					{getUploadedFileType() === "video" ? (
						<Video src={getUploadedFileURL()} />
					) : (
						<div className="group relative h-[620px] w-[450px] overflow-hidden rounded-lg border">
							<Image
								src={previewUrl}
								alt="Preview"
								fill
								className="object-cover transition-transform duration-300 group-hover:scale-105"
								sizes="(max-width: 1024px) 100vw, (max-width: 2200px) 50vw, 33vw"
							/>
							<div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
							<div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
								<Button
									size="sm"
									variant="secondary"
									onClick={handleThumbnailClick}
									className="h-9 w-9 p-0"
								>
									<Upload className="h-4 w-4" />
								</Button>
								<Button
									size="sm"
									variant="destructive"
									onClick={handleRemove}
									className="h-9 w-9 p-0"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
