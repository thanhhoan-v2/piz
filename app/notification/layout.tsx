import type { ReactNode } from "react"

export default function NotificationLayout({ children }: { children: ReactNode }) {
	return (
		<>
			{/* <LoadingScreen /> */}
			{children}
		</>
	)
}
