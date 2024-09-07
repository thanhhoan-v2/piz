import type { SupabaseUser } from "@models/supabaseUser"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKey } from "@utils/queryKeyFactory"
import { useSupabaseUser } from "../server/supabase/supabaseUser"

export const useQueryAppUser = () =>
	useQuery({
		queryKey: [queryKey.user.selectMain()],
		queryFn: async () => useSupabaseUser(),
	})

export const useQueryDataAppUser = (): SupabaseUser | undefined => {
	const queryClient = useQueryClient()
	return queryClient.getQueryData([queryKey.user.selectMain()])
}
