import { create } from "zustand"

export type UserStoreState = {
	userId: string | null
	email: string | null
	userName: string | null
	fullName: string | null
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
}

export const useUserStore = create<UserStoreState & UserStoreAction>(
	(set) => ({
		...initialState,
		setUserId: (userId) => set({ userId }),
		setEmail: (email) => set({ email }),
		setUserName: (userName) => set({ userName }),
		setFullName: (fullName) => set({ fullName }),
		reset: () => set(initialState),
	}),
)
