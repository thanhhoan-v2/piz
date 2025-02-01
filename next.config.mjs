import { withNextVideo } from "next-video/process"

/** @type {import('next').NextConfig} */
const nextConfig = {
	transpilePackages: ["lucide-react", "jotai-devtools"],
	experimental: {
		typedRoutes: true,
	},
	reactStrictMode: true,
	rewrites: async () => [
		{
			source: "/doc",
			destination: "/doc/index.html",
		},
	],
}

export default withNextVideo(nextConfig)
