import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * Legacy /listing/[slug] → /[slug] permanent redirect.
 *
 * Listing detail pages moved from `/listing/{slug}` to `/{slug}` (shorter,
 * keyword-rich URLs are better for SEO). Old links, bookmarks and search
 * engine indexes keep working via this 301, which also passes link equity
 * to the new URL. Unknown slugs fall through to the new page, which renders
 * its normal 404.
 */
export async function GET(_req: Request, { params }: RouteContext) {
  const { slug } = await params;
  return NextResponse.redirect(new URL(`/${slug}`, _req.url), 301);
}
