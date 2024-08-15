import localFont from "next/font/local"
import "@styles/globals.css"
import { AppLayout } from "@components/templates"
import { ThemeProvider } from "@providers/theme-provider"

const geist_sans = localFont({
	src: "../assets/fonts/GeistVF.woff",
	variable: "--font-geist-sans",
})

const geist_mono = localFont({
	src: "../assets/fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
})

const defaultUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: "http://localhost:3000"

export const metadata = {
	metadataBase: new URL(defaultUrl),
	title: "Piz",
	description: "An experimental social media platform. WIP.",
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html
			lang="en"
			suppressHydrationWarning={true}
			className={`${geist_sans.variable}${geist_mono.variable}`}
		>
			<body className="bg-background">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{/* <LoadingScreen duration={600} /> */}
					<AppLayout>{children}</AppLayout>
				</ThemeProvider>
			</body>
		</html>
	)
}
