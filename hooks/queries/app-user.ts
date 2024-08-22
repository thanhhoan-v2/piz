import { USER } from "@constants/query-key"
import { getAppUser } from "@supabase/functions/fetchUser"
import { useQuery, useQueryClient } from "@tanstack/react-query"

export const useQueryAppUser = () =>
	useQuery({
		queryKey: [USER.APP],
		queryFn: async () => getAppUser(),
	})

export const useQueryDataAppUser = () => {
	const queryClient = useQueryClient()
	queryClient.getQueryData([USER.APP])
}
