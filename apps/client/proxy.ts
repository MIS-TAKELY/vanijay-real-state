// apps/client/proxy.ts
import { apiUrl } from "lib/api/core/config";
import { API_ENDPOINTS } from "lib/api/core/endpoints";
import { NextRequest, NextResponse } from "next/server";

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
    return NextResponse.next();
  }

  if (rejected || !session?.user) {
    return NextResponse.redirect(new URL("/?auth=signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
