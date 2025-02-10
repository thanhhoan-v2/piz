import { LoadingScreen } from "@components/ui/loadings/loading-screen"
import type { ReactNode } from "react"

export default function UserProfileLayout({
	children,
}: { children: ReactNode }) {
	return (
		<>
			<LoadingScreen />

			{children}
		</>
	)
}
