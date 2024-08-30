/** @type {import('next').NextConfig} */
const nextConfig = {
	transpilePackages: ["lucide-react", "jotai-devtools"],
	experimental: {
		typedRoutes: true,
	},
}

export default nextConfig
