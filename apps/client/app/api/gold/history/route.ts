import { NextResponse } from "next/server";
import type {
  GoldHistoryResponse,
  HistoryPoint,
  HistoryRange,
} from "constants/gold/live";

// gold-api.com API key (https://gold-api.com — "gold.dev" docs live there).
// Sent as the `x-api-key` header on the key-gated /history endpoint.
// Keep it server-side — never reference it in client components.
const GOLD_API_KEY = process.env.GOLD_API_KEY ?? "";

const GOLD_API_BASE = "https://api.gold-api.com";

/** Symbols served by gold-api.com (see GET /symbols). */
const SUPPORTED_SYMBOLS = new Set([
  "XAU",
  "XAG",
  "XPT",
  "XPD",
  "HG",
  "BTC",
  "ETH",
]);

export const dynamic = "force-dynamic";

const DAY_S = 86_400;

/**
 * Range → { lookbackSeconds, groupBy }. Daily grouping for short ranges;
 * week/month for long ones to keep payloads small (hour/minute are
 * premium-only upstream, and the free tier allows 10 keyed requests/hour).
 */
const RANGE_CONFIG: Record<
  HistoryRange,
  { lookback: number; groupBy: "day" | "week" | "month" }
> = {
  "1M": { lookback: 31 * DAY_S, groupBy: "day" },
  "3M": { lookback: 92 * DAY_S, groupBy: "day" },
  "6M": { lookback: 183 * DAY_S, groupBy: "day" },
  "1Y": { lookback: 366 * DAY_S, groupBy: "day" },
  "5Y": { lookback: 5 * 366 * DAY_S, groupBy: "week" },
  MAX: { lookback: 0, groupBy: "month" }, // 0 → since 1900
};

/** Earliest timestamp used for the MAX range (gold-api data starts ~1900). */
const MAX_START_TS = -2208988800; // 1900-01-01T00:00:00Z

function toNumber(value: unknown): number {
  const n =
    typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

/** Normalize a period field value to lightweight-charts' "yyyy-mm-dd". */
function normalizeTime(raw: unknown): string | null {
  const s = String(raw ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s; // day / week start date
  if (/^\d{4}-\d{2}$/.test(s)) return `${s}-01`; // month
  if (/^\d{4}$/.test(s)) return `${s}-01-01`; // year
  return null;
}

/**
 * Upstream rows look like { "day": "2026-07-01", "avg_price": 4200.5 }.
 * The period key follows the groupBy (day/week/month/year) and the price
 * key follows the aggregation (avg_price/max_price/min_price).
 */
function normalizeRows(rows: unknown): HistoryPoint[] {
  if (!Array.isArray(rows)) return [];
  const points: HistoryPoint[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const record = row as Record<string, unknown>;
    const time =
      normalizeTime(record.day) ??
      normalizeTime(record.week) ??
      normalizeTime(record.month) ??
      normalizeTime(record.year) ??
      normalizeTime(record.date) ??
      normalizeTime(record.time);
    const price = toNumber(
      record.avg_price ?? record.max_price ?? record.min_price ?? record.price,
    );
    if (!time || price <= 0) continue;
    points.push({ time, price });
  }
  // Guarantee ascending order regardless of upstream orderBy.
  points.sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));
  return points;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbol = (url.searchParams.get("symbol") ?? "").toUpperCase();
  const rangeParam = (url.searchParams.get("range") ?? "1Y").toUpperCase();

  if (!SUPPORTED_SYMBOLS.has(symbol)) {
    return NextResponse.json(
      {
        ok: false,
        error: `Symbol "${symbol || "(none)"}" is not served by gold-api.com`,
      } satisfies GoldHistoryResponse,
      { status: 400 },
    );
  }

  const range = (
    ["1M", "3M", "6M", "1Y", "5Y", "MAX"].includes(rangeParam)
      ? rangeParam
      : "1Y"
  ) as HistoryRange;
  const config = RANGE_CONFIG[range];

  if (!GOLD_API_KEY) {
    return NextResponse.json(
      {
        ok: false,
        error: "GOLD_API_KEY is not configured on the server",
      } satisfies GoldHistoryResponse,
      { status: 502 },
    );
  }

  const endTs = Math.floor(Date.now() / 1000);
  const startTs =
    config.lookback === 0 ? MAX_START_TS : endTs - config.lookback;

  const upstream = new URL(`${GOLD_API_BASE}/history`);
  upstream.searchParams.set("symbol", symbol);
  upstream.searchParams.set("startTimestamp", String(startTs));
  upstream.searchParams.set("endTimestamp", String(endTs));
  upstream.searchParams.set("groupBy", config.groupBy);
  upstream.searchParams.set("aggregation", "avg");
  upstream.searchParams.set("orderBy", "asc");

  try {
    const res = await fetch(upstream, {
      headers: { "x-api-key": GOLD_API_KEY, Accept: "application/json" },
      // Free tier is limited to 10 keyed requests/hour — cache aggressively.
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const message =
        res.status === 401
          ? "gold-api.com rejected the API key (401)"
          : res.status === 429
            ? "gold-api.com rate limit reached (429) — try again later"
            : `gold-api.com history request failed (${res.status})`;
      return NextResponse.json(
        { ok: false, error: message } satisfies GoldHistoryResponse,
        { status: 502 },
      );
    }

    const payload: unknown = await res.json();
    const points = normalizeRows(payload);

    if (points.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "gold-api.com returned no history for this range",
        } satisfies GoldHistoryResponse,
        { status: 502 },
      );
    }

    return NextResponse.json(
      { ok: true, symbol, range, currency: "USD", points } satisfies GoldHistoryResponse,
      {
        headers: {
          // Short browser cache on top of the server-side revalidate.
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
      },
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "History fetch failed",
      } satisfies GoldHistoryResponse,
      { status: 500 },
    );
  }
}