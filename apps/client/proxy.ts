// apps/client/proxy.ts
import { apiUrl } from "lib/api/core/config";
import { API_ENDPOINTS } from "lib/api/core/endpoints";
import { NextRequest, NextResponse } from "next/server";

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
    const res = await fetch(apiUrl(API_ENDPOINTS.auth.getSession), {
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

  return NextResponse.next();
}

// All routes in the (auth) route group are protected.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/documents/:path*",
    "/appointments/:path*",
    "/favorites/:path*",
    "/inquiries/:path*",
    "/profile/:path*",
    "/questions/:path*",
    "/saved-searches/:path*",
    "/my-listings/:path*",
  ],
};
