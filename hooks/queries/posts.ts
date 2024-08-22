import { POST } from "@constants/query-key"
import { getAllPosts } from "@prisma/functions/post"
import type { PostProps } from "@prisma/global"
import { useQuery } from "@tanstack/react-query"

export const useQueryPosts = () =>
	useQuery<PostProps[]>({
		queryKey: [POST.ALL],
		queryFn: async () => getAllPosts(),
		// refetchOnMount: "always", // Always refetch data when the component mounts
		// refetchInterval: 1000 * 60, // Continuously fetch data every 1 minute
	})
