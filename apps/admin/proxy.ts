// apps/admin/proxy.ts — role-gated session guard for the admin console.
// Only users whose session role includes ADMIN may enter. Everything else is
// redirected to /login with a return-to query (mirrors apps/client/proxy.ts).
import { NextRequest, NextResponse } from "next/server";
import { AUTH_API_URL } from "./lib/config";

const PUBLIC_PATHS = ["/login", "/_next", "/favicon.ico"];

function signInRedirect(request: NextRequest) {
  const returnTo = request.nextUrl.pathname + request.nextUrl.search;
  const url = new URL(`/login?next=${encodeURIComponent(returnTo)}`, request.url);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  try {
    const res = await fetch(`${AUTH_API_URL}/api/auth/get-session`, {
      headers: {
        Accept: "application/json",
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });

    if (!res.ok) return signInRedirect(request);
    const session = (await res.json()) as { user?: { role?: string[] } | null } | null;
    const roles = session?.user?.role ?? [];
    if (!roles.includes("ADMIN")) return signInRedirect(request);

    return NextResponse.next();
  } catch {
    // Fail-closed: API unreachable => send to login.
    return signInRedirect(request);
  }
}
