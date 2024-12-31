import { createUser } from "@queries/server/user"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKey } from "@utils/queryKeyFactory"

export const useQueryAppUser = () =>
	useQuery({
		queryKey: [queryKey.user.selectMain()],
		// queryFn: async () => useSupabaseUser(),
	})

export const useQueryDataAppUser = () => {
	const queryClient = useQueryClient()
	return queryClient.getQueryData([queryKey.user.selectMain()])
}

export const useQueryCreateUser = (
	id: string,
	email: string,
	userName: string,
	fullName: string,
) =>
	useQuery({
		queryKey: [queryKey.user.selectMain()],
		queryFn: async () => createUser(id, email, userName, fullName),
		enabled: !!id && !!email && !!userName && !!fullName,
	})
