import { createSupabaseClientWithCookies } from "@utils/supabase/server";

export const fetchUser = async () => {
	"use server";
	const supabase = createSupabaseClientWithCookies();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	return user;
};
