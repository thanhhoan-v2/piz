// Snippet-related storage keys removed

export const STORAGE_KEY_POST_IMAGE_URL = "postImageUrl"
export const STORAGE_KEY_POST_VIDEO_URL = "postVideoUrl"

// Snippet removal function removed

export const storageRemovePostMediaFiles = () => {
	localStorage.removeItem(STORAGE_KEY_POST_IMAGE_URL)
	localStorage.removeItem(STORAGE_KEY_POST_VIDEO_URL)
}
