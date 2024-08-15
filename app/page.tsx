import { ROUTE } from "@constants/route";
import { createSupabaseClientWithCookies } from "@utils/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
	const supabase = createSupabaseClientWithCookies();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return redirect(ROUTE.SIGN_IN);
	}
	return <>{user?.email}</>;
}
