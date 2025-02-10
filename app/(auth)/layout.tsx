import Footer from "@components/layout/footer"
import { LoadingScreen } from "@components/ui/loadings/loading-screen"

/**
 * A layout component for authentication pages.
 *
 * It renders a full-screen, center-aligned container that
 * contains the given children and a footer.
 *
 * @param {React.ReactNode} children - The content to be rendered
 * @returns {JSX.Element} The layout component
 */
export default function AuthLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<>
			<LoadingScreen />

			<div className="h-screen w-screen flex-center">
				<main className="w-full flex-center px-4">{children}</main>
				<Footer />
			</div>
		</>
	)
}
