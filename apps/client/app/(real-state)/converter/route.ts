import { NextResponse } from "next/server";

/**
 * SEO-friendly alias: the standard English spelling "converter" forwards to
 * the canonical /convertor route (MALPOTH's brand spelling). A route handler
 * with an explicit 301 (instead of `redirect()`, which issues a 307) tells
 * search engines the move is permanent so link equity consolidates on
 * /convertor. Query strings are preserved.
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const target = new URL("/convertor", url.origin);
  target.search = url.search;
  return NextResponse.redirect(target, 301);
}