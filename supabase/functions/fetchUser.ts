"use server"

import { createSupabaseClientWithCookies } from "@utils/supabase/server"

export const getAppUser = async () => {
	const supabase = createSupabaseClientWithCookies()

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser()

	if (error) console.error("<< Supabase >> Fetching user error: ", error)

	return user
}
