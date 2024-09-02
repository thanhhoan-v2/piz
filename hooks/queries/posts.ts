import { POST } from "@constants/query-key"
import type { Post } from "@prisma/client"
import { getAllPosts } from "@prisma/functions/post"
import { useQuery } from "@tanstack/react-query"

export const useQueryAllPosts = () =>
	useQuery<Post[]>({
		queryKey: [POST.ALL],
		queryFn: getAllPosts,
		retry: 3,
	})
