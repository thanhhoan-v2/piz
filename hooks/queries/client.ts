import { QueryClient } from "@tanstack/react-query"

export const appQueryClient = () => {
	const queryClient = new QueryClient()
	return queryClient
}
