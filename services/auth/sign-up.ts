import { createSupabaseClientWithCookies } from "@utils/supabase/server"
import type { Route } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export const signUp = async (formData: FormData) => {
	"use server"
	const supabase = createSupabaseClientWithCookies()
	const origin = headers().get("origin")
	const email = formData.get("email") as string
	const password = formData.get("password") as string
	const username = formData.get("username") as string
	const first_name = formData.get("first_name") as string
	const last_name = formData.get("last_name") as string

	const { error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			emailRedirectTo: `${origin}/auth/callback`,
			data: {
				user_name: username,
				full_name: `${first_name} ${last_name}`,
			},
		},
	})

	if (error) {
		const redirectUrl = `${"/sign-in" as Route}?type=signup&message=${error.message}`

		return redirect(redirectUrl)
	}

	return redirect("/" as Route)
}
