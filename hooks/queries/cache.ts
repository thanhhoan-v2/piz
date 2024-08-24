import { QueryCache } from "@tanstack/react-query"

const queryCache = new QueryCache({
	onError: (error) => {
		console.log(error)
	},
	onSuccess: (data) => {
		console.log(data)
	},
	onSettled: (data, error) => {
		console.log(data, error)
	},
})

export const clearQueryCache = () => queryCache.clear()
