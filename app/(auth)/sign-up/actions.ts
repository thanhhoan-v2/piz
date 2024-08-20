import { createSupabaseClientWithCookies } from "@utils/supabase/server"
import type { Route } from "next"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export const signUp = async (formData: FormData) => {
	"use server"
	const supabase = createSupabaseClientWithCookies()
	const origin = headers().get("origin")
	const email = formData.get("email") as string
	const password = formData.get("password") as string
	const user_name = formData.get("user_name") as string
	const first_name = formData.get("first_name") as string
	const last_name = formData.get("last_name") as string

	const { error } = await supabase.auth.signUp({
		email,
		password, // hashed password
		options: {
			emailRedirectTo: `${origin}/callback`,
			data: {
				user_name: user_name,
				full_name: `${first_name} ${last_name}`,
				password: password, // for development only
			},
		},
	})

	if (error) {
		console.error("Sign-up error:", error)
		console.log(error)

		let errorMessage =
			"An error occurred during signing up. Maybe one of your first name, last name, or username is already taken."
		if (error.message.includes("username")) {
			errorMessage = "The username is already taken."
		} else if (error.message.includes("full_name")) {
			errorMessage = "The full name is already taken."
		}

		const redirectUrl = `${"/sign-up" as Route}?message=${errorMessage}`
		return redirect(redirectUrl)
	}

	revalidatePath("/")
	redirect("/" as Route)
}
