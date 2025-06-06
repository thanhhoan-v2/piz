import { createBrowserClient } from "@supabase/ssr"

// Keep this exactly like how it's used for code collab
export const createSupabaseBrowserClient = () =>
	createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
	)
