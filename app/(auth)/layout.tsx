import Footer from "@components/organisms/footer"

export default function AuthLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<>
			<div className="h-screen w-screen">
				<main className="h-[87vh] w-full flex-center">
					{children}
				</main>
				<Footer />
			</div>
		</>
	)
}
