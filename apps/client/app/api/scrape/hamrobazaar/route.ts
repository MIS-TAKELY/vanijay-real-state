import { NextRequest, NextResponse } from "next/server";
import { scrapeHamrobazaar, type ScrapeResult } from "lib/scrape/hamrobazaar";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/scrape/hamrobazaar?categoryId=...&keyword=...&page=1&pageSize=12
 *
 * Runs the Hamrobazaar listings scraper server-side (avoids CORS and keeps
 * the request pattern consistent). Returns live data when the target API
 * responds, otherwise a clearly-flagged sample dataset.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const rawPage = searchParams.get("page");
  const rawPageSize = searchParams.get("pageSize");
  const page = rawPage ? Number.parseInt(rawPage, 10) : 1;
  const pageSize = rawPageSize ? Number.parseInt(rawPageSize, 10) : 12;

  const result: ScrapeResult = await scrapeHamrobazaar({
    categoryId: searchParams.get("categoryId") ?? undefined,
    keyword: searchParams.get("keyword") ?? undefined,
    page: Number.isFinite(page) ? page : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : 12,
  });

  return NextResponse.json(result, {
    headers: {
      // Live scrapes are never cached; sample fallbacks are flagged per-request.
      "Cache-Control": "no-store, max-age=0",
      "X-Scrape-Source": result.source,
    },
  });
}
