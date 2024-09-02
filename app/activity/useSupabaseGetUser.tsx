"user server"

import { createSupabaseClientWithCookies } from "@utils/supabase/server"

export const useSupabaseGetUser = async () => {
	const supabase = createSupabaseClientWithCookies()
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser()

	if (error) return { user: null, error }
	return user
}
