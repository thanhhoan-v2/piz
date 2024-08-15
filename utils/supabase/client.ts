import { SUPABASE } from "@constants/dot-env";
import { createBrowserClient } from "@supabase/ssr";

export const createSupabaseClientForBrowser = () =>
	createBrowserClient(
		// biome-ignore lint/style/noNonNullAssertion: I dunno anything about supabase builtin function
		SUPABASE.URL!,
		// biome-ignore lint/style/noNonNullAssertion: I dunno anything about supabase builtin function
		SUPABASE.ANON_KEY!,
	);
