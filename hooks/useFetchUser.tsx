import { useEffect, useState } from "react"

type User = {
	email: string
	full_name: string
	user_metadata?: {
		user_name?: string
		full_name?: string
	}
}

const useFetchUser = () => {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await fetch("/api/fetch-user", {
					method: "POST",
				})
				if (response.ok) {
					const data = await response.json()
					setUser(data.data)
				} else {
					setError("Failed to fetch")
				}
			} catch (error) {
				setError(`An error occurred during fetching: ${error}`)
			} finally {
				setLoading(false)
			}
		}

		fetchUser()
	}, [])

	return { user, loading, error }
}

export default useFetchUser
