import { NextResponse } from "next/server";
import type { GoldLiveQuote } from "constants/gold/live";

// freegoldprice.org API key. Keep it server-side — never reference it in
// client components. Overridable via FREEGOLD_API_KEY env var.
const FREEGOLD_API_KEY =
  process.env.FREEGOLD_API_KEY ??
  "NgI0RNcpFeWYxgTWzEtT7egL8QpP1OJZlgiZf4CZMP18pocMDzqHgZbefego";

const GOLD_API_BASE = "https://api.gold-api.com";
const FREEGOLD_BASE = "https://freegoldprice.org/api/v2";

/** Metals returned by freegoldprice (per ounce, all currencies). */
const FREEGOLD_METALS = ["Gold", "Silver", "Platinum", "Palladium"] as const;
const FREEGOLD_SYMBOL_BY_NAME: Record<string, string> = {
  Gold: "XAU",
  Silver: "XAG",
  Platinum: "XPT",
  Palladium: "XPD",
};

/** Assets only available via gold-api.com (USD) — converted to NPR. */
const USD_ONLY_SYMBOLS = ["BTC", "ETH", "HG"] as const;

export const dynamic = "force-dynamic";

function toNumber(value: unknown): number {
  const n =
    typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

export async function GET() {
  try {
    const [symbolsRes, gsppRes] = await Promise.all([
      fetch(`${GOLD_API_BASE}/symbols`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${FREEGOLD_BASE}?key=${FREEGOLD_API_KEY}&action=GSPPJ`, {
        next: { revalidate: 300 },
        headers: { Accept: "application/json" },
      }),
    ]);

    if (!gsppRes.ok || !symbolsRes.ok) {
      return NextResponse.json(
        { error: `Upstream price API failed (${gsppRes.status})` },
        { status: 502 },
      );
    }

    const payload = await gsppRes.json();
    // The GSPPJ response is wrapped under the action key on some responses.
    const data = payload?.GSPPJ ?? payload ?? {};

    const symbols: Array<{ name: string; symbol: string }> =
      await symbolsRes.json();

    // Derive the NPR→USD rate from gold, which is present in both APIs.
    const goldUsd = toNumber(data.Gold?.USD?.ask);
    const goldNpr = toNumber(data.Gold?.NPR?.ask);
    const usdToNpr = goldUsd > 0 ? goldNpr / goldUsd : 0;

    const quotes: GoldLiveQuote[] = [];

    // 1) Precious metals from freegoldprice — native NPR ask/bid, plus USD.
    for (const name of FREEGOLD_METALS) {
      const metal = data[name];
      if (!metal?.NPR) continue;
      const ask = toNumber(metal.NPR.ask);
      const bid = toNumber(metal.NPR.bid);
      if (ask <= 0) continue;
      const usdAsk = toNumber(metal.USD?.ask);
      const usdBid = toNumber(metal.USD?.bid);
      quotes.push({
        symbol: FREEGOLD_SYMBOL_BY_NAME[name] ?? name,
        name,
        price: ask,
        usdPrice: usdAsk > 0 ? usdAsk : ask / (usdToNpr || 1),
        bid: bid > 0 ? bid : null,
        ask,
        usdBid: usdBid > 0 ? usdBid : null,
        usdAsk: usdAsk > 0 ? usdAsk : null,
        currency: "NPR",
      });
    }

    // 2) BTC / ETH / Copper from gold-api.com (USD) → NPR via gold-derived rate.
    const usdQuotes = await Promise.all(
      USD_ONLY_SYMBOLS.map(async (symbol) => {
        const res = await fetch(`${GOLD_API_BASE}/price/${symbol}`, {
          next: { revalidate: 120 },
        });
        if (!res.ok) return null;
        return (await res.json()) as {
          symbol: string;
          name: string;
          price: number;
        };
      }),
    );

    for (const quote of usdQuotes) {
      if (!quote || toNumber(quote.price) <= 0) continue;
      const priceUsd = toNumber(quote.price);
      quotes.push({
        symbol: quote.symbol,
        name: quote.name,
        price: priceUsd * (usdToNpr || 1),
        usdPrice: priceUsd,
        bid: null,
        ask: null,
        usdBid: null,
        usdAsk: null,
        currency: "NPR",
      });
    }

    // Preserve gold-api.com symbol ordering for the ticker.
    const order = new Map(symbols.map((s) => [s.symbol, true]));
    const ordered = quotes
      .filter((q) => order.has(q.symbol))
      .sort(
        (a, b) =>
          symbols.findIndex((s) => s.symbol === a.symbol) -
          symbols.findIndex((s) => s.symbol === b.symbol),
      );

    return NextResponse.json({
      ok: true,
      date: data.date ?? null,
      unit: data.unit ?? "ounce",
      usdToNpr,
      quotes: ordered,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Live price fetch failed" },
      { status: 500 },
    );
  }
}
