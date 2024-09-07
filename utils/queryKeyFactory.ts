export const queryKey = {
	user: {
		all: ["users"] as const,
		// user - select
		selects: () => [...queryKey.user.all, "select"] as const,
		// user - select - main
		selectMain: () => [...queryKey.user.all, "select", "main"] as const,
		// user - select - { id }
		selectId: (id: string) => [...queryKey.user.selects(), id] as const,
	},
	post: {
		all: ["posts"] as const,
		// posts - insert
		insert: () => [...queryKey.post.all, "insert"] as const,
		// posts - select
		selects: () => [...queryKey.post.all, "select"] as const,
		// posts - select - { id }
		selectId: (id: string) => [...queryKey.post.selects(), id] as const,
		// posts - select - { id } - counts
		selectCount: (id: string) =>
			[...queryKey.post.selectId(id), "count"] as const,
		// posts - select - { id } - reactions - { userId }
		selectReactionByUser: ({
			userId,
			postId,
		}: { userId?: string; postId: string }) =>
			[...queryKey.post.selectId(postId), "reaction", userId] as const,
	},
	comment: {
		all: ["comments"] as const,
		// comments - post - { postId }
		selectPost: (postId: string) =>
			[...queryKey.comment.all, "post", postId] as const,
		// comments - insert
		insert: () => [...queryKey.comment.all, "insert"] as const,
		// comments - select
		selects: () => [...queryKey.comment.all, "select"] as const,
		// comments - select - { id }
		selectId: (id: string) => [...queryKey.comment.selects(), id] as const,
		// comments - select - { id } - counts
		selectCount: (id: string) =>
			[...queryKey.comment.selectId(id), "count"] as const,
		// comments - select - { id } - reactions - { userId }
		selectReactionByUser: ({
			userId,
			commentId,
		}: { userId: string; commentId: string }) =>
			[...queryKey.comment.selectId(commentId), "reaction", userId] as const,
	},
	noti: {
		all: ["notis"] as const,
		// notis - select
		selects: () => [...queryKey.noti.all, "select"] as const,
		// notis - select - { userId }
		selectId: (userId: string) =>
			[...queryKey.noti.selects(), userId] as const,
	},
}
