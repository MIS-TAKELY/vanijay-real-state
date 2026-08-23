import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * POST /api/revalidate/sitemap — on-demand ISR invalidation for /sitemap.xml.
 *
 * The NestJS API calls this (fire-and-forget) whenever a property is created,
 * updated or deleted, so a new listing appears in /sitemap.xml immediately and
 * a deleted one disappears — instead of waiting for the hourly ISR window
 * configured in app/sitemap.ts.
 *
 * Security: gated by a shared secret (`SITEMAP_REVALIDATE_SECRET`) sent as the
 * `x-revalidate-secret` header. Keep it server-side; both apps must agree on
 * the same value.
 */
export const dynamic = "force-dynamic";

const SECRET = process.env.SITEMAP_REVALIDATE_SECRET ?? "";

export async function POST(request: Request) {
  if (!SECRET) {
    return NextResponse.json(
      { ok: false, error: "SITEMAP_REVALIDATE_SECRET is not configured" },
      { status: 502 },
    );
  }

  if (request.headers.get("x-revalidate-secret") !== SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Drop the cached sitemap so the next request regenerates it from the API's
  // current LIVE inventory. Also revalidate "/" — the homepage advertises the
  // newest listings and shares the same data source.
  revalidatePath("/sitemap.xml");
  revalidatePath("/");

  return NextResponse.json({ ok: true, revalidated: "/sitemap.xml", now: Date.now() });
}