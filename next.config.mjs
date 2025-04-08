import { withNextVideo } from "next-video/process"

/** @type {import('next').NextConfig} */
const nextConfig = {
	transpilePackages: ["lucide-react"],
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
	images: {
		remotePatterns: [
			{
				hostname: "uqtsoanofvoverpyodnd.supabase.co",
			},
		],
	},
}

export default withNextVideo(nextConfig)
