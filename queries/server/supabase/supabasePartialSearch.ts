import { useSupabaseServer } from "@hooks/supabase/server"

export type SupabasePartialSearchProps = {
	prefix: string
	prefixFunction: string
}

export const searchUsersByUserNamePrefix = "search_users_by_username_prefix"

export const usePartialSearch = async ({
	prefix,
	prefixFunction,
}: SupabasePartialSearchProps) => {
	"use server"
	const supabase = useSupabaseServer()

	const { data, error } = await supabase.rpc(prefixFunction, { prefix })
	if (error) {
		console.error("<< Supabase >> Error when searching: ", error)
		return null
	}

	return data
}
