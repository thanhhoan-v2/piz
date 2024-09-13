import { useSupabaseBrowser } from "@hooks/supabase/browser"

export type SupabasePartialSearchProps = { prefix: string }

export const usePartialSearch = async ({ prefix }: { prefix: string }) => {
	const supabase = useSupabaseBrowser()

	const { data, error } = await supabase.rpc(
		"search_users_by_username_prefix",
		{ prefix },
	)
	if (error) {
		console.error("<< Supabase >> Error when searching: \n", error)
		return null
	}

	return data
}
