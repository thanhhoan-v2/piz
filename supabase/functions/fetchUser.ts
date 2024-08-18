import { createSupabaseClientWithCookies } from "@utils/supabase/server"

export const fetchUser = async () => {
	const supabase = createSupabaseClientWithCookies()

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser()

	if (error)
		console.error("SupabaseFunctions fetchUser error: ", error)

	return user
}
