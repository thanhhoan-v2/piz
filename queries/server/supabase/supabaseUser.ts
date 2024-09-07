"use server"

import { useSupabaseServer } from "@hooks/supabase/server"

export const useSupabaseUser = async () => {
	const supabase = useSupabaseServer()

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser()

	if (error) console.error("<< Supabase >> Fetching user error: ", error)

	return user
}
