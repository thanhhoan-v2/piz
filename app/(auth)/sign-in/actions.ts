import { useSupabaseServer } from "@hooks/supabase/server"
import type { Route } from "next"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signIn(formData: FormData) {
	"use server"
	const supabase = useSupabaseServer()

	const data = {
		email: formData.get("email") as string,
		password: formData.get("password") as string,
	}

	const { error } = await supabase.auth.signInWithPassword(data)

	if (error) {
		console.error("Error signing in:", error)
		return redirect(`${"/sign-in" as Route}?message=Wrong email or password`)
	}

	revalidatePath("/")
	redirect("/" as Route)
}
