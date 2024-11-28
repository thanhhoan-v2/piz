import Footer from "@components/layout/footer"

export default function AuthLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<>
      {/* h-screen -> signin page OK, singup NOT OK */}
			<div className="h-screen w-screen flex-center">
				<main className="w-full flex-center px-4">{children}</main>
				<Footer />
			</div>
		</>
	)
}
