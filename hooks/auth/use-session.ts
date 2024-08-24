import { USER } from "@constants/local-storage"

export const getUserSession = () => {
	const session = localStorage.getItem(USER.SESSION)
	return session ? JSON.parse(session) : null
}
