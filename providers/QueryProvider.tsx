"use client"
import { getQueryClient } from "@queries/getQueryClient"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import type React from "react"

/*
 * NEVER DO THIS:
 * const queryClient = new QueryClient()
 *
 * Creating the queryClient at the file root level makes the cache shared
 * between ALL requests and means ALL data gets passed to ALL users.
 * Besides being bad for performance, this also leaks any sensitive data.
 */

export default function QueryProvider({ children }: { children: React.ReactNode }) {
	// const { toast } = useToast()
	// // -> Instead do this, which ensures each request has its own cache:
	// const [queryClient] = React.useState(
	// 	() =>
	// 		new QueryClient({
	// 			queryCache: new QueryCache({
	// 				onError: (error, query) => {
	// 					// 🎉 only show error toasts if we already have data in the cache
	// 					// which indicates a failed background update
	// 					if (query.state.data !== undefined) {
	// 						toast({
	// 							title: "Something went wrong",
	// 							description: error.message,
	// 						})
	// 					}
	// 				},
	// 			}),
	// 			defaultOptions: {
	// 				queries: {
	// 					/*
	// 					 * With SSR, we usually want to set some default staleTime
	// 					 * above 0 to avoid refetching immediately on the client
	// 					 */
	// 					staleTime: 1000 * 20, // how long it stays "fresh" -> marked as "stale" -> refetch
	// 				},
	// 				dehydrate: {
	// 					// include pending queries in dehydration
	// 					shouldDehydrateQuery: (query) =>
	// 						defaultShouldDehydrateQuery(query) ||
	// 						query.state.status === "pending",
	// 				},
	// 			},
	// 		}),
	// )

	// QueryClient is now managed without jotai

	const queryClient = getQueryClient()

	return (
		<QueryClientProvider client={queryClient}>
			{/* <ResetProvider> */}
			{/* <HydrateAtoms>{children}</HydrateAtoms> */}
			{children}
			{/* <DevTools /> */}
			<ReactQueryDevtools initialIsOpen={true} />
			{/* </ResetProvider> */}
		</QueryClientProvider>
	)
}
