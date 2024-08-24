"use server"

import { createSupabaseClientWithCookies } from "@utils/supabase/server"

type signUpProps = {
	email: string
	password: string
	firstName: string
	lastName: string
	userName: string
}

export const useSignUp = async ({
	email,
	password,
	firstName,
	lastName,
	userName,
}: signUpProps) => {
	const supabase = createSupabaseClientWithCookies()

	const {
		data: { user, session },
		error,
	} = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				userName: userName,
				fullName: `${firstName} ${lastName}`,
				password: password, // for development only
			},
		},
	})

	return { user, session, error }
}
