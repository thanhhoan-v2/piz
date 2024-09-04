import { getRandomUserList } from "@prisma/functions/user"
import { useQuery } from "@tanstack/react-query"

export const useRandomUserList = () => {
	useQuery({
		queryKey: ["random_users"],
		queryFn: async () => getRandomUserList(),
	})
}
