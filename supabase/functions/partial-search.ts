import { createSupabaseClientForBrowser } from "@utils/supabase/client"

type SupabasePartialSearchProps = {
	prefix: string
	prefixFunction: string
}

export const supabasePartialSearch = async ({
	prefix,
	prefixFunction,
}: SupabasePartialSearchProps) => {
	const supabase = createSupabaseClientForBrowser()

	const { data, error } = await supabase.rpc(prefixFunction, { prefix })
	if (error) {
		console.error("Error when searching: ", error)
		return null
	}

	return data
}
