// apps/client/proxy.ts
import { AUTH_API_URL } from "lib/api/core/config";
import { API_ENDPOINTS } from "lib/api/core/endpoints";
import { NextRequest, NextResponse } from "next/server";

function authApiUrl(path: string): string {
  return `${AUTH_API_URL}${path}`;
}

// Redirect to the sign-in flow, remembering the page the user was trying to
// visit so they can be sent back after authenticating.
function signInRedirectUrl(request: NextRequest) {
  const returnTo = request.nextUrl.pathname + request.nextUrl.search;
  return new URL(
    `/?auth=signin&redirect=${encodeURIComponent(returnTo)}`,
    request.url,
  );
}

export async function proxy(request: NextRequest) {
  let session: { user?: unknown } | null = null;
  let rejected = false;

  try {
    // Hit the API over the internal Docker network (AUTH_API_URL), not the
    // public https://api.malpoth.com URL. Going out through Cloudflare from
    // the Next.js container often 403s/times out, which fail-closes to sign-in.
    const res = await fetch(authApiUrl(API_ENDPOINTS.auth.getSession), {
      headers: {
        Accept: "application/json",
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });

    if (res.status === 401 || res.status === 403) {
      rejected = true;
    } else if (res.ok) {
      session = (await res.json()) as { user?: unknown } | null;
    }
  } catch {
    // Fail closed: if the session can't be verified (API down / timeout),
    // treat the user as signed out rather than silently letting them through.
    return NextResponse.redirect(signInRedirectUrl(request));
  }

  if (rejected || !session?.user) {
    return NextResponse.redirect(signInRedirectUrl(request));
  }

  // The customer-facing app is for BUYER/AGENCY-style accounts only. Admin
  // sessions are sent back to the public site (not the sign-in flow, since the
  // session is already valid).
  const roles = (session.user as { role?: string[] } | null)?.role ?? [];
  if (roles.includes("ADMIN")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// All routes in the (auth) route group are protected.
export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/cart",
    "/cart/:path*",
    "/documents/:path*",
    "/appointments",
    "/appointments/:path*",
    "/favorites",
    "/favorites/:path*",
    "/inquiries",
    "/inquiries/:path*",
    "/profile",
    "/profile/:path*",
    "/questions",
    "/questions/:path*",
    "/saved-searches",
    "/saved-searches/:path*",
    "/my-listings",
    "/my-listings/:path*",
  ],
};
