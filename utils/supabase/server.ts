import { SUPABASE } from "@constants/dot-env";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createSupabaseClientWithCookies = () => {
	const cookieStore = cookies();

	return createServerClient(
		// biome-ignore lint/style/noNonNullAssertion: I dunno anything about supabase builtin function
		SUPABASE.URL!,
		// biome-ignore lint/style/noNonNullAssertion: I dunno anything about supabase builtin function
		SUPABASE.ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				// biome-ignore lint/suspicious/noExplicitAny: I dunno anything about cookiesToSet
				setAll(cookiesToSet: any) {
					try {
						for (const { name, value, options } of cookiesToSet) {
							cookieStore.set(name, value, options);
						}
					} catch (error) {
						// The `set` method was called from a Server Component.
						// This can be ignored if you have middleware refreshing
						// user sessions.
						console.log("Supabase Server Error: ", error);
					}
				},
			},
		},
	);
};
