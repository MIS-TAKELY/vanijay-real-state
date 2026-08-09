import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  output: "standalone",

  transpilePackages: ["@repo/ui"],

  turbopack: {
    resolveAlias: {
      "@": [path.resolve(__dirname, "../../packages/ui/src")],
    },
  },

  async rewrites() {
    // AUTH_API_URL → local dev override (e.g. http://localhost:5000)
    // falls back to internal Docker service name in production
    const apiUrl = process.env.AUTH_API_URL || "http://api:5000";
    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiUrl}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
