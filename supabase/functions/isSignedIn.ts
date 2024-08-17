import { ROUTE } from "@constants/route"
import { createSupabaseClientWithCookies } from "@utils/supabase/server"
import { redirect } from "next/navigation"

const supabase = createSupabaseClientWithCookies()

export const isSignedIn = async () => {
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		return redirect(ROUTE.SIGN_IN)
	}
}
