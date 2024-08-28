import { POST } from "@constants/query-key"
import { getAllPosts } from "@prisma/functions/post"
import type { PrismaPost } from "@prisma/global"
import { useQuery } from "@tanstack/react-query"

export const useQueryAllPosts = () =>
	useQuery<PrismaPost[]>({
		queryKey: [POST.ALL],
		queryFn: getAllPosts,
	})
