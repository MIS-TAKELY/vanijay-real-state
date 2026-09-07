import { NextResponse } from "next/server";

/**
 * Spelling alias: /area-guide → canonical /area-guid.
 * Permanent 301 consolidates link equity on the existing URL.
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const subpath = url.pathname.replace(/^\/area-guide\/?/, "");
  const target = new URL(
    subpath ? `/area-guid/${subpath}` : "/area-guid",
    url.origin,
  );
  target.search = url.search;
  return NextResponse.redirect(target, 301);
}
