import localFont from "next/font/local"
import "@styles/globals.css"
import "jotai-devtools/styles.css"
import { AppLayout } from "@components/templates"
import QueryProvider from "@providers/query-provider"
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
				<QueryProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<AppLayout>{children}</AppLayout>
					</ThemeProvider>
				</QueryProvider>
			</body>
		</html>
	)
}
