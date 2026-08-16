"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  METAL_META_LIST,
  METALS_DATA,
  buildMetalData,
  type MetalData,
} from "constants/gold/metals";
import type { GoldLiveResponse } from "constants/gold/live";

const POLL_INTERVAL_MS = 60_000;

/**
 * Live NPR prices for the 7 gold-api symbols. Fetches from our own
 * /api/gold/live proxy (which keeps the freegoldprice.org key server-side),
 * falls back to static METALS_DATA while loading or on failure.
 */
export function useLiveMetalPrices(): {
  metals: MetalData[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
} {
  const [metals, setMetals] = useState<MetalData[]>(METALS_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/gold/live", { cache: "no-store" });
      if (!res.ok) {
        let message = `Live prices unavailable (${res.status})`;
        try {
          const body = (await res.json()) as GoldLiveResponse;
          if (body?.error) message = body.error;
        } catch {
          // ignore parse errors — keep the default message
        }
        throw new Error(message);
      }
      const body = (await res.json()) as GoldLiveResponse;
      const quotes = body?.quotes ?? [];
      if (quotes.length === 0) {
        throw new Error("No live quotes returned");
      }

      const next = METAL_META_LIST.map((meta) => {
        const quote = quotes.find((q) => q.symbol === meta.symbol);
        if (!quote) return null;
        return buildMetalData(meta.id, quote.price, {
          bid: quote.bid ?? undefined,
          ask: quote.ask ?? undefined,
          usdPrice: quote.usdPrice,
          usdBid: quote.usdBid ?? undefined,
          usdAsk: quote.usdAsk ?? undefined,
        });
      }).filter((m): m is MetalData => m !== null);

      if (next.length > 0) {
        setMetals(next);
        setLastUpdated(new Date());
        setError(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load live prices",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    timer.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [refresh]);

  return { metals, loading, error, lastUpdated };
}
