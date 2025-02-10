export type PostVisibilityEnumType =
	| "PUBLIC"
	| "FOLLOWERS_ONLY"
	| "MENTIONED_ONLY"
	| "FANS_ONLY"
	| "ME_ONLY"

export const PostVisibilityEnumMap = {
	PUBLIC: "PUBLIC",
	FOLLOWERS_ONLY: "FOLLOWERS_ONLY",
	MENTIONED_ONLY: "MENTIONED_ONLY",
	FANS_ONLY: "FANS_ONLY",
	ME_ONLY: "ME_ONLY",
}

export const PostVisibilityEnumArray = [
	"PUBLIC",
	"FOLLOWERS_ONLY",
	"MENTIONED_ONLY",
	"FANS_ONLY",
	"ME_ONLY",
]

export type IMentionedResult = {
	id: string
	userName: string
}
