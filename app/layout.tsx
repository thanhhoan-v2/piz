import { AppLayout } from "@components/layout"
import QueryProvider from "@providers/QueryProvider"
import { StackProvider, StackTheme } from "@stackframe/stack"
import "@styles/globals.css"
import "jotai-devtools/styles.css"
import { Toaster } from "@components/ui/Sonner"
import { ThemeProvider } from "next-themes"
import localFont from "next/font/local"
import NextTopLoader from "nextjs-toploader"
import { Suspense } from "react"
import { stackServerApp } from "../stack"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

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
				<StackProvider app={stackServerApp}>
					<StackTheme>
						<NextTopLoader
							color="#ff006e"
							initialPosition={0.1}
							crawlSpeed={200}
							height={5}
							crawl={true}
							showSpinner={false}
							easing="ease"
							speed={400}
							shadow={false}
							zIndex={1600}
							showAtBottom={false}
						/>
						<Analytics />
						<SpeedInsights />
						<QueryProvider>
							<ThemeProvider
								attribute="class"
								defaultTheme="system"
								enableSystem
								disableTransitionOnChange
							>
								<Toaster />
								<Suspense>
									<AppLayout>{children}</AppLayout>
								</Suspense>
							</ThemeProvider>
						</QueryProvider>
					</StackTheme>
				</StackProvider>
			</body>
		</html>
	)
}
