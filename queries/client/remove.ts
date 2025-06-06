import type { QueryClient } from "@tanstack/react-query"

// Clears all connected caches
export const useQueryClientClearCache = (queryClient: QueryClient) => queryClient.clear()

// Remove queries from the cache based on their query keys
export const useQueryClientRemoveQueries = (queryClient: QueryClient, key: string) =>
	queryClient.removeQueries({ queryKey: [key], exact: true })
