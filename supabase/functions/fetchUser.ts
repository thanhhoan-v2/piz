"use server"

import { createSupabaseClientWithCookies } from "@utils/supabase/server"

export const getAppUser = async () => {
	const supabase = createSupabaseClientWithCookies()

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser()

	if (error) console.error("[SUPABASE_FUNCTION] fetchUser error: ", error)

	return user
}
