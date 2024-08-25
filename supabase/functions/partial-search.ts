"use server"
import { createSupabaseClientWithCookies } from "@utils/supabase/server"

type SupabasePartialSearchProps = {
	prefix: string
	prefixFunction: string
}

export const supabasePartialSearch = async ({
	prefix,
	prefixFunction,
}: SupabasePartialSearchProps) => {
	const supabase = createSupabaseClientWithCookies()

	const { data, error } = await supabase.rpc(prefixFunction, { prefix })
	if (error) {
		console.error("<< Supabase >> Error when searching: ", error)
		return null
	}

	return data
}
