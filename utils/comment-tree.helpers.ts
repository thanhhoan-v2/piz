import type { CommentWithChildren } from "@components/ui/comment"
import type { Comment as IComment } from "@prisma/client"

export const buildCommentTree = (comments: IComment[], rootId?: string) => {
	const commentMap: { [key: string]: CommentWithChildren } = {}
	const roots: CommentWithChildren[] = []

	// Initialize all comments in a map (for quick access)
	for (const comment of comments) {
		commentMap[comment.id] = { ...comment, children: [] }
	}

	if (rootId) {
		for (const comment of comments) {
			if (comment.parentId === rootId && comment.id !== comment.parentId) {
				// Initialize roots
				roots.push(commentMap[comment.id])
			} else {
				// and link children to their respective parents
				if (comment.parentId && commentMap[comment.parentId]) {
					commentMap[comment.parentId].children?.push(commentMap[comment.id])
				}
			}
		}
	} else {
		for (const comment of comments) {
			if (comment.id === comment.parentId) {
				// Initialize roots
				roots.push(commentMap[comment.id])
			} else {
				// and link children to their respective parents
				if (comment.parentId && commentMap[comment.parentId]) {
					commentMap[comment.parentId].children?.push(commentMap[comment.id])
				}
			}
		}
	}

	// Append children to their respective parents recursively
	// Traverses the tree & ensures that all nested comments are correctly added to their parents
	function addChildren(parent: CommentWithChildren) {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		for (const child of parent.children!) {
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			if (commentMap[child.id].children!.length! > 0) {
				addChildren(commentMap[child.id])
			}
		}
	}

	for (const root of roots) {
		addChildren(root)
	}

	return roots
}

export const extractFromCommentTreeById = (
	comments: CommentWithChildren[],
	extractId: string,
): CommentWithChildren[] => {
	for (const comment of comments) {
		if (comment.id === extractId) {
			return [comment]
		}
		if (comment.children && comment.children.length > 0) {
			const result = extractFromCommentTreeById(comment.children, extractId)
			if (result.length > 0) {
				return result
			}
		}
	}
	return []
}
