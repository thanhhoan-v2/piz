import type { IMentionedResult } from "@/types/post.types"
import { Badge } from "@components/ui/Badge"
import { ScrollArea } from "@components/ui/ScrollArea"
import { Textarea } from "@components/ui/Textarea"
import type { SearchResultProps } from "@components/ui/search/SearchList"
import SearchList from "@components/ui/search/SearchList"
import { cn } from "@utils/cn"
import CodeEditor from "./attachment/CodeEditor"
import ImageUploadForm from "./attachment/ImageUploadForm"
import { VideoUploadForm } from "./attachment/VideoUploadForm"

type PostFormContentProps = {
	mentionedUsers: IMentionedResult[]
	postContent: string
	textareaRef: React.RefObject<HTMLTextAreaElement>
	handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
	isAddingSnippet: boolean
	setIsAddingSnippet: (value: boolean) => void
	isAddingVideo: boolean
	setIsAddingVideo: (value: boolean) => void
	isAddingImage: boolean
	setIsAddingImage: (value: boolean) => void
	showMentionSuggestions: boolean
	searchResults: SearchResultProps
	userId?: string
	handleSelectUser: (id: string, userName: string) => void
	onImageRemove: () => void
	onImageUpload: (url: string) => void
	onVideoRemove: () => void
	onVideoUpload: (url: string) => void
	onSnippetRemove: () => void
	onSnippetUpload: (id: string) => void
	onSnippetCodeChange: (code: string) => void
	onSnippetLangChange: (lang: string) => void
	onSnippetThemeChange: (theme: string) => void
	onSnippetPreview: (isSnippetPreviewed: boolean) => void
}

export function PostFormContent({
	mentionedUsers,
	postContent,
	textareaRef,
	handleInputChange,
	showMentionSuggestions,
	searchResults,
	userId,
	handleSelectUser,
	// Image's
	isAddingImage,
	setIsAddingImage,
	onImageRemove,
	onImageUpload,
	// Video's
	isAddingVideo,
	setIsAddingVideo,
	onVideoUpload,
	onVideoRemove,
	// Snippet's
	isAddingSnippet,
	setIsAddingSnippet,
	onSnippetRemove,
	onSnippetCodeChange,
	onSnippetLangChange,
	onSnippetThemeChange,
	onSnippetPreview,
}: PostFormContentProps) {
	return (
		<ScrollArea className="h-[80vh] p-4">
			<div className="flex-col items-start gap-3 p-4">
				<div className="flex-y-center gap-2">
					{mentionedUsers.length > 0 &&
						mentionedUsers.map((mentionedUser) => (
							<Badge variant="outline" key={mentionedUser.id}>
								@{mentionedUser.userName}
							</Badge>
						))}
				</div>
				<div className="mb-1 w-full flex-start flex-col gap-2">
					<div className="flex-col gap-4">
						<Textarea
							autoFocus
							ref={textareaRef}
							value={postContent}
							onChange={handleInputChange}
							placeholder="What's on your mind?"
							className={cn(
								"min-h-[10px] max-w-[90vw] resize-none border-none p-0 text-xl focus-visible:ring-0",
							)}
						/>
					</div>
				</div>
				{isAddingSnippet && (
					<CodeEditor
						onSnippetRemoveAction={onSnippetRemove}
						setIsAddingSnippetAction={setIsAddingSnippet}
						onSnippetCodeChangeAction={onSnippetCodeChange}
						onSnippetLangChangeAction={onSnippetLangChange}
						onSnippetThemeChangeAction={onSnippetThemeChange}
						onSnippetPreviewAction={onSnippetPreview}
					/>
				)}
				{isAddingVideo && (
					<VideoUploadForm
						onVideoUploadAction={onVideoUpload}
						onVideoRemoveAction={onVideoRemove}
						setIsAddingVideoAction={setIsAddingVideo}
					/>
				)}
				{isAddingImage && (
					<ImageUploadForm
						onImageRemoveAction={onImageRemove}
						onImageUploadAction={onImageUpload}
						setIsAddingImageAction={setIsAddingImage}
					/>
				)}
			</div>

			{showMentionSuggestions && searchResults?.length > 0 && (
				<div className="mt-[20px] h-fit w-full flex-center">
					<SearchList
						searchResults={searchResults}
						appUserId={userId}
						isMention
						containerClassname="my-0 w-[90%] rounded-lg border-2 border-white"
						onSearchResultClick={handleSelectUser}
					/>
				</div>
			)}
		</ScrollArea>
	)
}
