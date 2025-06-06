import { createUser, getViewingUserInfo } from "@queries/server/user"
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

export const useQueryCreateUser = ({
	id,
	email,
	userName,
	userAvatarUrl,
}: {
	id: string
	email?: string | null
	userName?: string | null
	userAvatarUrl?: string | null
}) =>
	useQuery({
		queryKey: [queryKey.user.selectMain()],
		queryFn: async () =>
			createUser({
				id: id,
				email: email,
				userName: userName,
				userAvatarUrl: userAvatarUrl,
			}),
		enabled: !!id && !!email,
	})

export const useQueryDataViewingUser = (userName: string) =>
	useQuery({
		queryKey: [queryKey.user.selectUserName(userName)],
		queryFn: async () => getViewingUserInfo(userName),
	})
