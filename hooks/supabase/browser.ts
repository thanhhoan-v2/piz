import { SUPABASE } from "@constants/dot-env"
import { createBrowserClient } from "@supabase/ssr"

export const useSupabaseBrowser = () =>
	// biome-ignore lint/style/noNonNullAssertion: I dunno anything about supabase builtin function
	createBrowserClient(SUPABASE.URL!, SUPABASE.ANON_KEY!)
