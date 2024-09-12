"use server"

import { useSupabaseServer } from "@hooks/supabase/server"

export type SupabasePartialSearchProps = {
	prefix: string
	prefixFunction: "user_name"
}

export const usePartialSearch = async ({
	prefix,
	prefixFunction,
}: SupabasePartialSearchProps) => {
	const supabase = useSupabaseServer()

	let prefixString = ""
	if (prefixFunction === "user_name")
		prefixString = "search_users_by_username_prefix"

	const { data, error } = await supabase.rpc(prefixString, { prefix })
	if (error) {
		console.error("<< Supabase >> Error when searching: ", error)
		return null
	}

	return data
}
