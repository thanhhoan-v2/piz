import { createSupabaseClientWithCookies } from "@utils/supabase/server"
import type { Route } from "next"
import { redirect } from "next/navigation"

export const isSignedInWithRedirect = async () => {
	const supabase = createSupabaseClientWithCookies()

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser()

	if (!user || error)
		// If user is not signed in, redirect to sign in page
		redirect("/sign-in" as Route)

	return user
}
