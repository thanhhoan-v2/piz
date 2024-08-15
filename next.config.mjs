/** @type {import('next').NextConfig} */
const nextConfig = {
	transpilePackages: ["lucide-react"],
	experimental: {
		typedRoutes: true,
	},
};

export default nextConfig;
