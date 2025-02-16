export const STORAGE_KEY_SNIPPET_ID = "snippetId"
export const STORAGE_KEY_SNIPPET_CODE = "snippetCode"
export const STORAGE_KEY_SNIPPET_LANG = "snippetLang"

export const STORAGE_KEY_POST_IMAGE_URL = "postImageUrl"
export const STORAGE_KEY_POST_VIDEO_URL = "postVideoUrl"

export const storageRemoveSnippet = () => {
	localStorage.removeItem(STORAGE_KEY_SNIPPET_ID)
	localStorage.removeItem(STORAGE_KEY_SNIPPET_CODE)
	localStorage.removeItem(STORAGE_KEY_SNIPPET_LANG)
}
