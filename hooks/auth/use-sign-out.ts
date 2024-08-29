import { USER } from "@constants/query-key"
import { createSupabaseClientWithCookies } from "@utils/supabase/server"

export const signOut = async () => {
	const supabase = createSupabaseClientWithCookies()
	await supabase.auth.signOut()
	localStorage.removeItem(USER.SESSION)
}
