import { create } from "zustand"

// User store state
export type UserStoreState = {
	userId: string | null
	email: string | null
	userName: string | null
	userAvatarUrl: string | null
	fullName: string | null
	isSignedIn: boolean
}

// User store actions
export type UserStoreAction = {
	setUserId: (userId: string) => void
	setEmail: (email: string) => void
	setUserName: (userName: string) => void
	setUserAvatarUrl: (userAvatarUrl: string) => void
	setFullName: (fullName: string) => void
	reset: () => void
}

// Initial state
const initialState: UserStoreState = {
	userId: null,
	email: null,
	userName: null,
	userAvatarUrl: null,
	fullName: null,
	isSignedIn: false,
}

export const useUserStore = create<UserStoreState & UserStoreAction>((set) => ({
	...initialState,
	setUserId: (userId) => set({ userId, isSignedIn: true }),
	setEmail: (email) => set({ email, isSignedIn: true }),
	setUserName: (userName) => set({ userName, isSignedIn: true }),
	setFullName: (fullName) => set({ fullName, isSignedIn: true }),
	setUserAvatarUrl: (userAvatarUrl) => set({ userAvatarUrl, isSignedIn: true }),
	reset: () => set(initialState),
}))
