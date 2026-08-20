"use client";

import { useEffect, useMemo, useState } from "react";
import type { HistoryPoint, HistoryRange } from "constants/gold/live";
import type { MetalData } from "constants/gold/metals";

export interface GoldHistoryState {
  /** Daily (or weekly/monthly for long ranges) USD price points. */
  points: HistoryPoint[];
  loading: boolean;
  error: string | null;
  /** False when the series is a simulated fallback (upstream unavailable). */
  isRealData: boolean;
}

/** Deterministic PRNG so the simulated fallback is stable per symbol+range. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function toIsoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** How many synthetic points each range should produce, and their spacing. */
const SYNTH_CONFIG: Record<
  HistoryRange,
  { count: number; stepDays: number; stepMonths: number }
> = {
  "1M": { count: 31, stepDays: 1, stepMonths: 0 },
  "3M": { count: 92, stepDays: 1, stepMonths: 0 },
  "6M": { count: 183, stepDays: 1, stepMonths: 0 },
  "1Y": { count: 366, stepDays: 1, stepMonths: 0 },
  "5Y": { count: 261, stepDays: 7, stepMonths: 0 },
  MAX: { count: 660, stepDays: 0, stepMonths: 1 },
};

/**
 * Simulated daily series anchored at the live USD price — used only when the
 * gold-api.com history endpoint is unavailable (e.g. invalid API key).
 * Walks backwards from the live price so the series always ends on it.
 */
function buildSyntheticPoints(
  metal: MetalData,
  range: HistoryRange,
): HistoryPoint[] {
  const { count, stepDays, stepMonths } = SYNTH_CONFIG[range];
  const rand = mulberry32(hashSeed(`${metal.symbol}:${range}`));
  const vol = metal.volatility * (stepMonths > 0 ? 4 : stepDays > 1 ? 2 : 1);

  const now = new Date();
  const times: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    if (stepMonths > 0) d.setMonth(d.getMonth() - i * stepMonths);
    else d.setDate(d.getDate() - i * stepDays);
    times.push(toIsoDay(d));
  }

  // Backwards random walk from the live price, then reverse.
  const prices: number[] = [metal.usdPrice];
  for (let i = 1; i < count; i++) {
    const prev = prices[i - 1] ?? metal.usdPrice;
    const drift = (rand() - 0.495) * vol * 2; // slight upward bias
    prices.push(Math.max(prev * (1 - drift), prev * 0.5));
  }
  prices.reverse();

  return times.map((time, i) => ({ time, price: prices[i] ?? metal.usdPrice }));
}

/**
 * Real USD price history for one gold-api.com symbol from our
 * /api/gold/history proxy. Falls back to a clearly-flagged simulated series
 * when the upstream request fails (invalid key, rate limit, outage).
 */
export function useGoldHistory(
  metal: MetalData,
  range: HistoryRange,
): GoldHistoryState {
  const [realPoints, setRealPoints] = useState<HistoryPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/gold/history?symbol=${metal.symbol}&range=${range}`, {
      cache: "no-store",
    })
      .then(async (res) => {
        const body = (await res.json()) as {
          ok?: boolean;
          points?: HistoryPoint[];
          error?: string;
        };
        if (!res.ok || !body?.ok || !body.points?.length) {
          throw new Error(body?.error ?? `History unavailable (${res.status})`);
        }
        if (!cancelled) {
          setRealPoints(body.points);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setRealPoints(null);
          setError(
            err instanceof Error ? err.message : "Failed to load history",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [metal.symbol, range]);

  const synthetic = useMemo(
    () => buildSyntheticPoints(metal, range),
    // Regenerate only when the anchor price or shape inputs change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metal.symbol, metal.usdPrice, metal.volatility, range],
  );

  return {
    points: realPoints ?? synthetic,
    loading,
    error,
    isRealData: realPoints !== null,
  };
}