"use server"
import { createSupabaseClientWithCookies } from "@utils/supabase/server"
import type { Route } from "next"
import { redirect } from "next/navigation"

export const signOut = async () => {
	const supabase = createSupabaseClientWithCookies()
	await supabase.auth.signOut()
	redirect("/sign-in" as Route)
}
