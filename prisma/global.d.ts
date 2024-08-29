export type {
	// TABLES
	Post as PrismaPost,
	PostReaction as PrismaPostReaction,
	AppUser as PrismaUser,
	// ENUMS
	PostVisibility as PrismaPostVisibilityEnum,
} from "@prisma/client"

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
