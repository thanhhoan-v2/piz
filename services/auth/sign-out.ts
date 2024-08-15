"use server"
import { createSupabaseClientWithCookies } from "@utils/supabase/server"

export const signOut = async () => {
	const supabase = createSupabaseClientWithCookies()
	await supabase.auth.signOut()
}
