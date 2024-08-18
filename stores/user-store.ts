import { create } from "zustand"

export type UserStoreState = {
	userId: string | null
	email: string | null
	userName: string | null
	fullName: string | null
	isSignedIn: boolean
}

export type UserStoreAction = {
	setUserId: (userId: string) => void
	setEmail: (email: string) => void
	setUserName: (userName: string) => void
	setFullName: (fullName: string) => void
	reset: () => void
}

const initialState: UserStoreState = {
	userId: null,
	email: null,
	userName: null,
	fullName: null,
	isSignedIn: false,
}

export const useUserStore = create<UserStoreState & UserStoreAction>(
	(set) => ({
		...initialState,
		setUserId: (userId) => set({ userId, isSignedIn: true }),
		setEmail: (email) => set({ email, isSignedIn: true }),
		setUserName: (userName) => set({ userName, isSignedIn: true }),
		setFullName: (fullName) => set({ fullName, isSignedIn: true }),
		reset: () => set(initialState),
	}),
)
