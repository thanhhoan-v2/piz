"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { DevTools } from "jotai-devtools"
import React from "react"

/*
 * NEVER DO THIS:
 * const queryClient = new QueryClient()
 *
 * Creating the queryClient at the file root level makes the cache shared
 * between ALL requests and means ALL data gets passed to ALL users.
 * Besides being bad for performance, this also leaks any sensitive data.
 */

export default function QueryProvider({
	children,
}: { children: React.ReactNode }) {
	// -> Instead do this, which ensures each request has its own cache:
	const [queryClient] = React.useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						/*
						 * With SSR, we usually want to set some default staleTime
						 * above 0 to avoid refetching immediately on the client
						 */
						staleTime: 1000 * 20, // how long it stays "fresh" -> marked as "stale" -> refetch
					},
				},
			}),
	)

	/*
	 * Reference the same queryClient in both atomWithQuery and other parts of the app.
	 * Without this, our useQueryClient hook will return a different QueryClient object.
	 */
	// const HydrateAtoms = ({ children }: { children: React.ReactNode }) => {
	// 	useHydrateAtoms([[queryClientAtom, queryClient]])
	// 	return children
	// }

	return (
		<QueryClientProvider client={queryClient}>
			{/* <ResetProvider> */}
			{/* <HydrateAtoms>{children}</HydrateAtoms> */}
			<DevTools />
			{children}
			<ReactQueryDevtools initialIsOpen={true} />
			{/* </ResetProvider> */}
		</QueryClientProvider>
	)
}
