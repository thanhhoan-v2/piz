import type { ReactNode } from "react"

export default function SettingsLayout({ children }: { children: ReactNode }) {
	return (
		<>
			{/* <LoadingScreen /> */}
			{children}
		</>
	)
}
