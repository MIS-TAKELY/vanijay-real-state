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
    return [
      {
        source: "/api/auth/:path*",
        destination: `${process.env.AUTH_API_URL}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
