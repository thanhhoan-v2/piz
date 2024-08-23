import { USER } from "@constants/query-key"
import { getAppUser } from "@supabase/functions/fetchUser"
import type { SupabaseUserProps } from "@supabase/global"
import { useQuery, useQueryClient } from "@tanstack/react-query"

export const useQueryAppUser = () =>
	useQuery({
		queryKey: [USER.APP],
		queryFn: async () => getAppUser(),
	})

export const useQueryDataAppUser = (): SupabaseUserProps | undefined => {
	const queryClient = useQueryClient()
	return queryClient.getQueryData([USER.APP])
}
