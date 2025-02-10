import { LoadingScreen } from "@components/ui/loadings/loading-screen"
import type React from "react"

export default function SearchLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<>
			<LoadingScreen />

			{children}
		</>
	)
}
