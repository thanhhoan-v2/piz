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
	const userName = formData.get("userName") as string
	const firstName = formData.get("firstName") as string
	const lastName = formData.get("lastName") as string
	const password = formData.get("password") as string

	const { data, error } = await supabase.auth.signUp({
		email,
		password, // hashed password
		options: {
			emailRedirectTo: `${origin}/callback`,
			data: {
				userName: userName,
				fullName: `${firstName} ${lastName}`,
				password: password,
			},
		},
	})

	console.log("Created user: ", data.user)

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
