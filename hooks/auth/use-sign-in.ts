"use server"

import { createSupabaseClientWithCookies } from "@utils/supabase/server"

type signInProps = {
	email: string
	password: string
}

export const useSignIn = async ({ email, password }: signInProps) => {
	const supabase = createSupabaseClientWithCookies()
	const {
		data: { user, session },
		error,
	} = await supabase.auth.signInWithPassword({ email, password })

	return { user, session, error }
}
