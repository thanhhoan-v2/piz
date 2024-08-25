"use client"

import { Provider, createStore } from "jotai"
import { DevTools } from "jotai-devtools"
import "jotai-devtools/styles.css"

export default function StoreProvider({
	children,
}: { children: React.ReactNode }) {
	const userStore = createStore()

	return (
		<>
			<Provider store={userStore}>
				<DevTools store={userStore} />
				{children}
			</Provider>
		</>
	)
}
