export const queryKey = {
	user: {
		all: ["users"] as const,
		// user - select
		selects: () => [...queryKey.user.all, "select"] as const,
		// user - select - main
		selectMain: () => [...queryKey.user.all, "select", "main"] as const,
		// user - select - { id }
		selectId: (id: string) => [...queryKey.user.selects(), id] as const,
		// user - select - { userName }
		selectUserName: (userName: string) => [...queryKey.user.selects(), userName] as const,
	},
	post: {
		all: ["posts"] as const,
		// posts - insert
		insert: () => [...queryKey.post.all, "insert"] as const,
		// posts - select
		selects: () => [...queryKey.post.all, "select"] as const,
		// posts - select - { id }
		selectId: (id: string) => [...queryKey.post.selects(), id] as const,
		// posts - select - { userId }
		selectUser: (userId: string) => [...queryKey.post.selects(), userId] as const,
		// posts - select - { teamId }
		byTeam: (teamId: string) => [...queryKey.post.selects(), "team", teamId] as const,
		// posts - select - { id } - counts
		selectCount: (id: string) => [...queryKey.post.selectId(id), "count"] as const,
		// posts - select - { id } - reactions - { userId }
		selectReactionByUser: ({ userId, postId }: { userId?: string | null; postId: string }) =>
			[...queryKey.post.selectId(postId), "reaction", userId] as const,
	},
	comment: {
		all: ["comments"] as const,
		// comments - insert
		insert: () => [...queryKey.comment.all, "insert"] as const,
		// comments - post - { postId }
		selectPost: (postId: string) => [...queryKey.comment.all, "post", postId] as const,
		// comments - select
		selects: () => [...queryKey.comment.all, "select"] as const,
		// comments - select - { id }
		selectId: (id: string) => [...queryKey.comment.selects(), id] as const,
		// comments - select - { id } - child
		selectIdChild: (id: string) => [...queryKey.comment.selects(), id, "child"] as const,
		// comments - select - { id } - count
		selectCountByPost: (id: string) => [...queryKey.comment.selectId(id), "count"] as const,
		// comments - select - { id } - count - { parentId }
		selectCountByComment: ({
			commentId,
			parentId,
		}: { commentId: string; parentId: string | null }) =>
			[...queryKey.comment.selectId(commentId), "count", parentId] as const,
		// comments - select - { id } - reactions - { userId }
		selectReactionByUser: ({ userId, commentId }: { userId?: string; commentId: string }) =>
			[...queryKey.comment.selectId(commentId), "reaction", userId] as const,
	},
	noti: {
		all: ["notis"] as const,
		// notis - select
		selects: () => [...queryKey.noti.all, "select"] as const,
		// notis - select - { id }
		selectId: (id: number) => [...queryKey.noti.selects(), id] as const,
	},
	follow: {
		all: ["follows"] as const,
		selectFollower: (followerId: string) => ["follows", "follower", followerId] as const,
		selectFollowee: (followeeId: string) => ["follows", "followee", followeeId] as const,
	},
	snippet: {
		all: ["snippet"] as const,
		selects: () => [...queryKey.snippet.all, "select"] as const,
		selectId: (id: string | null) => [...queryKey.snippet.selects(), id] as const,
	},
	teamJoinRequests: {
		all: ["teamJoinRequests"] as const,
		// teamJoinRequests - select
		selects: () => [...queryKey.teamJoinRequests.all, "select"] as const,
		// teamJoinRequests - select - { teamId }
		byTeam: (teamId: string) => [...queryKey.teamJoinRequests.selects(), "team", teamId] as const,
		// teamJoinRequests - select - { userId }
		byUser: (userId: string) => [...queryKey.teamJoinRequests.selects(), "user", userId] as const,
	},
} as const
