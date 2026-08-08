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
    const apiUrl = process.env.AUTH_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiUrl}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
