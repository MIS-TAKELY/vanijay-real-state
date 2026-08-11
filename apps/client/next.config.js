import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  output: "standalone",

  transpilePackages: ["@repo/ui"],

  images: {
    // Property media is uploaded to Cloudinary — allow the Next.js <Image>
    // optimizer to load those remote thumbnails in My Listings / cards.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },

  turbopack: {
    resolveAlias: {
      "@": [path.resolve(__dirname, "../../packages/ui/src")],
    },
  },

  async rewrites() {
    // AUTH_API_URL → local dev override (e.g. http://localhost:5000)
    // falls back to NEXT_PUBLIC_API_URL, then the internal Docker service name
    const apiUrl =
      process.env.AUTH_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://api:5000";
    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiUrl}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
