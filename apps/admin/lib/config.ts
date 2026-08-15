// Server-side internal API origin (Docker service name, overridable for local dev).
export const AUTH_API_URL =
  process.env.AUTH_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

// Public/browser origin the admin app talks to for API data (via rewrite or direct).
export const NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
