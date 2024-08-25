import { USER } from "@constants/query-key"
import { getAppUser } from "@supabase/functions/fetchUser"
import { useQuery } from "@tanstack/react-query"

export const useQueryAppUser = () =>
	useQuery({
		queryKey: [USER.APP],
		queryFn: getAppUser,
	})

// export const useQueryDataAppUser = (): SupabaseUserProps | undefined => {
// 	const queryClient = useQueryClient()
// 	return queryClient.getQueryData([USER.APP])
// }
