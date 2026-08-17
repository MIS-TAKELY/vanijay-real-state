import { AUTH_API_URL } from "lib/api/core/config";
import { headers } from "next/headers";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role?: string[];
  image?: string | null;
}

export interface Session {
  user?: SessionUser | null;
  session?: unknown | null;
}

/**
 * Resolve the better-auth session server-side using the request cookie.
 *
 * Mirrors the middleware (proxy.ts): hit the auth API over the internal
 * network (AUTH_API_URL) with the browser's cookie, and fail closed to
 * "signed out" if the API is unreachable so protected content never renders
 * for an unverifiable session.
 */
export async function getSession(): Promise<Session | null> {
  try {
    const requestHeaders = await headers();
    const res = await fetch(`${AUTH_API_URL}/api/auth/get-session`, {
      headers: {
        Accept: "application/json",
        cookie: requestHeaders.get("cookie") ?? "",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as Session | null;
  } catch {
    return null;
  }
}
