import localFont from "next/font/local"
import "@styles/globals.css"
import "jotai-devtools/styles.css"
import { AppLayout } from "@components/layout"
import { LoadingScreen } from "@components/ui/loadings/loading-screen"
import { Toaster } from "@components/ui/toast/Toaster"
import QueryProvider from "@providers/QueryProvider"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "next-themes"

const geistSans = localFont({
	src: "../assets/fonts/GeistVF.woff",
	variable: "--font-geist-sans",
})

const geistMono = localFont({
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
			className={`${geistSans.variable}${geistMono.variable}`}
		>
			<body className="bg-background" suppressHydrationWarning>
				<Analytics />
				<SpeedInsights />
				<QueryProvider>
					<LoadingScreen duration={200} />
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<Toaster />
						<AppLayout>{children}</AppLayout>
					</ThemeProvider>
				</QueryProvider>
			</body>
		</html>
	)
}
