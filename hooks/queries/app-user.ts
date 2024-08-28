import { USER } from "@constants/query-key"
import { getAppUser } from "@supabase/functions/fetchUser"
import type { SupabaseUser } from "@supabase/global"
import { useQuery, useQueryClient } from "@tanstack/react-query"

export const useQueryAppUser = () =>
	useQuery({
		queryKey: [USER.APP],
		queryFn: getAppUser,
	})

export const useQueryDataAppUser = (): SupabaseUser | undefined => {
	const queryClient = useQueryClient()
	return queryClient.getQueryData([USER.APP])
}
