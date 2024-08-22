"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import React from "react"

// NEVER DO THIS:
// const queryClient = new QueryClient()
//
// Creating the queryClient at the file root level makes the cache shared
// between all requests and means _all_ data gets passed to _all_ users.
// Besides being bad for performance, this also leaks any sensitive data.

export default function ReactQueryProvider({
	children,
}: { children: React.ReactNode }) {
	// Instead do this, which ensures each request has its own cache:
	const [queryClient] = React.useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						// With SSR, we usually want to set some default staleTime
						// above 0 to avoid refetching immediately on the client
						staleTime: 1000 * 20, // how long it stays "fresh" -> marked as "stale" -> refetch
					},
				},
			}),
	)

	return (
		<QueryClientProvider client={queryClient}>
			{/* <HydrationBoundary state={dehydrate(queryClient)}> */}
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
			{/* </HydrationBoundary> */}
		</QueryClientProvider>
	)
}
