import { LoadingScreen } from "@components/ui/loadings/loading-screen"
import { Suspense } from "react"

export default function MainLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<>
			<Suspense>
				<LoadingScreen />
			</Suspense>
			<main>{children}</main>
		</>
	)
}
