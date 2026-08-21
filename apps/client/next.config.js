import path from "path";
import { fileURLToPath } from "url";
import { withSerwist } from "@serwist/turbopack";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = withSerwist({
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
      {
        protocol: "https",
        hostname: "images.unsplash.com",
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
      {
        // Proxy server-side GraphQL / REST requests to the API backend so
        // that server-to-server loopback fetches (e.g. AUTH_API_URL pointing
        // at the public domain) don't 404 on the Next.js server.
        source: "/api/v1/:path*",
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ];
  },
});

export default nextConfig;
