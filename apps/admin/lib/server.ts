import { AUTH_API_URL, NEXT_PUBLIC_API_URL } from "./config";

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

/** Resolve the current session (better-auth) using the request cookie. */
export async function getSession(cookie?: string): Promise<Session | null> {
  try {
    const res = await fetch(`${AUTH_API_URL}/api/auth/get-session`, {
      headers: {
        Accept: "application/json",
        ...(cookie ? { cookie } : {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as Session | null;
  } catch {
    return null;
  }
}

export function isAdmin(user?: SessionUser | null): boolean {
  return Array.isArray(user?.role) && user.role.includes("ADMIN");
}

/** Server-side authenticated fetch to the admin API, forwarding the cookie. */
export async function adminFetch<T>(cookie: string | undefined, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Admin fetch ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}
