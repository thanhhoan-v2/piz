import { createServerClient } from "@supabase/ssr"
import type { cookies } from "next/headers"

export const createSupabaseServerClient = (
	cookieStore: ReturnType<typeof cookies>,
) => {
	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				async getAll() {
					return (await cookieStore).getAll()
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(async ({ name, value, options }) =>
							(await cookieStore).set(name, value, options),
						)
					} catch {
						// The `setAll` method was called from a Server Component.
						// This can be ignored if you have middleware refreshing
						// user sessions.
					}
				},
			},
		},
	)
}
