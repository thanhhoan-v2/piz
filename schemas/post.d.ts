// - id: string
// - content: string (needs to be rendered as markdown) -> PostContent -> process tags
// - share_url: string
// - shares: number (number of times the post is shared)
// - comments: [] of comments
// - attachments: [] of media assets
// - reactions: [] of likes[], dislikes[] -> PostFooter
// - created_at: string -> PostHeader
// - updated_at: string -> PostHeader
// - user_name: string -> PostHeader
// - avatar_url: string -> PostHeader

type Attachment = {
	url: string
	type: "image" | "gif"
}

type Like = {
	id: string
	user_id: string
	user_name: string
	avatar_url: string
}

type Dislike = {
	id: string
	user_id: string
	user_name: string
	avatar_url: string
}

export type CommentProps = {
	id: string
}

export type PostProps = {
	id: string
	created_at: string
	updated_at: string
	content: string
	share_url: string // /userId/post/postId
	no_shared: number
	comments: CommentProps[]
	attachments: Attachment[]
	reactions: {
		likes: Like[]
		dislikes: Dislike[]
	}
	// TODO: should i pass User into this ? - maybe not, not very efficient
	user_name: string
	avatar_url: string
}
